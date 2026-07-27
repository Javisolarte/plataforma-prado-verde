import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, conjuntoId?: number) {
    const term = query ? query.trim() : '';
    if (!term) return { apartamentos: [] };

    const termLikeAnywhere = `%${term}%`;
    const numConjuntoId = conjuntoId ? Number(conjuntoId) : null;

    // Filtros de conjunto navegando por las relaciones
    const cFilterA = numConjuntoId ? `AND t."conjuntoId" = ${numConjuntoId}` : '';
    const cFilterR = numConjuntoId ? `AND r."conjuntoId" = ${numConjuntoId}` : '';
    const cFilterP = numConjuntoId ? `AND (p."conjuntoId" = ${numConjuntoId} OR t."conjuntoId" = ${numConjuntoId})` : '';

    // 1. Buscar IDs por Apartamento o Torre (ej: Apto 101, Torre 1, Torre A)
    const qAptos = this.prisma.$queryRawUnsafe<any[]>(`
      SELECT a.id FROM "Apartamento" a 
      JOIN "Torre" t ON t.id = a."torreId"
      WHERE (a.numero ILIKE $1 OR t.nombre ILIKE $1 OR (t.nombre || ' ' || a.numero) ILIKE $1) ${cFilterA} LIMIT 25;
    `, termLikeAnywhere);

    // 2. Buscar IDs por Residente (Nombre, Cédula/Documento, Teléfono)
    const qRes = this.prisma.$queryRawUnsafe<any[]>(`
      SELECT ra."apartamentoId" as id FROM "Residente" r
      JOIN "ResidenteApartamento" ra ON ra."residenteId" = r.id
      WHERE (r.nombre ILIKE $1 OR r.documento ILIKE $1 OR r.telefono ILIKE $1) ${cFilterR} LIMIT 25;
    `, termLikeAnywhere);

    // 3. Buscar IDs por Vehículo (Placa) o Parqueadero (Número exacto o parcial)
    const qVeh = this.prisma.$queryRawUnsafe<any[]>(`
      SELECT DISTINCT p."apartamentoId" as id FROM "Parqueadero" p
      LEFT JOIN "Vehiculo" v ON v."parqueaderoId" = p.id
      LEFT JOIN "Apartamento" a ON a.id = p."apartamentoId"
      LEFT JOIN "Torre" t ON t.id = a."torreId"
      WHERE (v.placa ILIKE $1 OR p.numero ILIKE $1 OR p.numero = $2) AND p."apartamentoId" IS NOT NULL ${cFilterP} LIMIT 25;
    `, termLikeAnywhere, term);

    const [aptos, res, vehs] = await Promise.all([qAptos, qRes, qVeh]);
    
    // Consolidar IDs únicos
    const idSet = new Set<number>();
    aptos.forEach(x => x?.id && idSet.add(x.id));
    res.forEach(x => x?.id && idSet.add(x.id));
    vehs.forEach(x => x?.id && idSet.add(x.id));

    if (idSet.size === 0) return { apartamentos: [] };

    const idsList = Array.from(idSet).join(',');

    // Consultar el perfil unificado exacto para los apartamentos encontrados
    const perfiles = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        a.id, a.numero,
        json_build_object('nombre', t.nombre) as torre,
        COALESCE((
           SELECT json_agg(json_build_object('nombre', res.nombre, 'telefono', res.telefono, 'cedula', res.documento))
           FROM "ResidenteApartamento" ra
           JOIN "Residente" res ON res.id = ra."residenteId"
           WHERE ra."apartamentoId" = a.id
        ), '[]'::json) as residentes,
        COALESCE((
           SELECT json_agg(json_build_object(
             'numero', p.numero, 'tipo', p.tipo,
             'vehiculos', COALESCE((
                SELECT json_agg(json_build_object('placa', v.placa, 'tipo', v.tipo, 'marca', v.marca, 'color', v.color))
                FROM "Vehiculo" v WHERE v."parqueaderoId" = p.id
             ), '[]'::json)
           ))
           FROM "Parqueadero" p WHERE p."apartamentoId" = a.id
        ), '[]'::json) as parqueaderos
      FROM "Apartamento" a
      JOIN "Torre" t ON t.id = a."torreId"
      WHERE a.id IN (${idsList})
      ORDER BY t.nombre ASC, a.numero ASC
    `);

    return { apartamentos: perfiles };
  }
}
