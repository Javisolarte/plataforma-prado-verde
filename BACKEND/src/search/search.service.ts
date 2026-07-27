import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, conjuntoId?: number) {
    const term = query ? query.trim() : '';
    if (!term) return { apartamentos: [] };

    const termLike = `%${term}%`;
    const numConjuntoId = conjuntoId ? Number(conjuntoId) : null;
    const cFilter = numConjuntoId ? `AND t."conjuntoId" = ${numConjuntoId}` : '';

    // Una única consulta SQL ultra optimizada
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
      WHERE a.id IN (
        SELECT DISTINCT a_sub.id FROM "Apartamento" a_sub
        JOIN "Torre" t_sub ON t_sub.id = a_sub."torreId"
        LEFT JOIN "ResidenteApartamento" ra_sub ON ra_sub."apartamentoId" = a_sub.id
        LEFT JOIN "Residente" r_sub ON r_sub.id = ra_sub."residenteId"
        LEFT JOIN "Parqueadero" p_sub ON p_sub."apartamentoId" = a_sub.id
        LEFT JOIN "Vehiculo" v_sub ON v_sub."parqueaderoId" = p_sub.id
        WHERE (
          a_sub.numero ILIKE $1 
          OR t_sub.nombre ILIKE $1 
          OR (t_sub.nombre || ' ' || a_sub.numero) ILIKE $1
          OR r_sub.nombre ILIKE $1 
          OR r_sub.documento ILIKE $1 
          OR r_sub.telefono ILIKE $1 
          OR p_sub.numero ILIKE $1
          OR v_sub.placa ILIKE $1
        ) ${cFilter}
        LIMIT 15
      )
      ORDER BY t.nombre ASC, a.numero ASC
    `, termLike);

    return { apartamentos: perfiles };
  }
}
