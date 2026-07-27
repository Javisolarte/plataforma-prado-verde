import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth';
import { ConjuntoService, Conjunto } from '../../core/services/conjunto.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { TorreService, Torre } from '../../core/services/torre.service';
import { ApartamentoService, Apartamento } from '../../core/services/apartamento.service';
import { ParqueaderoService, Parqueadero } from '../../core/services/parqueadero.service';
import { ResidenteService } from '../../core/services/residente.service';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { SearchService, SearchResult } from '../../core/services/search.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms'; // para ngModel en el buscador
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ModalComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private conjuntoService = inject(ConjuntoService);
  private usuarioService = inject(UsuarioService);
  private torreService = inject(TorreService);
  private aptoService = inject(ApartamentoService);
  private parqueaderoService = inject(ParqueaderoService);
  private residenteService = inject(ResidenteService);
  private vehiculoService = inject(VehiculoService);
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);
  
  user = this.authService.currentUser;
  
  // State
  view: 'dashboard' | 'conjuntos' | 'usuarios' | 'torres' | 'aptos' | 'parqueaderos' | 'residentes' | 'vehiculos' | 'vigilante' = 'dashboard';
  managingConjuntoId = signal<number | null>(null);

  // Inline Edit State
  editingCell = signal<{id: string, field: string, value: string} | null>(null);

  startEdit(rowId: string, field: string, value: string) {
    this.editingCell.set({ id: rowId, field, value });
  }

  cancelEdit() {
    this.editingCell.set(null);
  }

  saveEdit(entityType: 'residente' | 'parqueadero' | 'vehiculo', id: number, field: string) {
    const cell = this.editingCell();
    if (!cell) return;
    
    let updateReq;
    if (entityType === 'residente') {
      updateReq = this.residenteService.update(id, { [field]: cell.value.toUpperCase() });
    } else if (entityType === 'parqueadero') {
      updateReq = this.parqueaderoService.update(id, { [field]: cell.value.toUpperCase() });
    } else if (entityType === 'vehiculo') {
      updateReq = this.vehiculoService.update(id, { [field]: cell.value.toUpperCase() });
    }
    
    if (updateReq) {
      updateReq.subscribe(() => {
        this.loadAllData();
        this.editingCell.set(null);
      });
    }
  }

  // Vigilante Search State
  vigilanteSearchTerm = signal<string>('');
  vigilanteResults = signal<SearchResult | null>(null);
  vigilanteSearching = signal<boolean>(false);
  private searchTimer: any;

  onVigilanteSearchInput(val: string) {
    this.vigilanteSearchTerm.set(val);
    if (this.searchTimer) clearTimeout(this.searchTimer);

    if (!val || val.trim().length === 0) {
      this.vigilanteResults.set(null);
      this.vigilanteSearching.set(false);
      return;
    }

    this.vigilanteSearching.set(true);
    this.searchTimer = setTimeout(() => {
      this.doVigilanteSearch();
    }, 150);
  }

  doVigilanteSearch() {
    let term = this.vigilanteSearchTerm().trim();
    if (!term) {
      this.vigilanteResults.set(null);
      this.vigilanteSearching.set(false);
      return;
    }
    
    term = term.toUpperCase();
    this.vigilanteSearching.set(true);
    const cId = this.contextConjuntoId || undefined;
    this.searchService.globalSearch(term, cId).subscribe({
      next: (res) => {
        this.vigilanteResults.set(res);
        this.vigilanteSearching.set(false);
      },
      error: (err) => {
        console.error('Error en búsqueda de vigilante:', err);
        this.vigilanteSearching.set(false);
      }
    });
  }
  
  // Estado para colapsar/expandir barra lateral
  sidebarCollapsed = signal<boolean>(false);

  toggleSidebar() {
    this.sidebarCollapsed.update(val => !val);
  }

  // Data Signals
  conjuntos = signal<Conjunto[]>([]);
  usuarios = signal<User[]>([]);
  torres = signal<Torre[]>([]);
  aptos = signal<Apartamento[]>([]);
  parqueaderos = signal<Parqueadero[]>([]);
  residentes = signal<any[]>([]);
  vehiculos = signal<any[]>([]);

  // Buscador Global
  searchTerm = signal<string>('');

  // Dashboard Stats Computed
  stats = computed(() => {
    const isSuper = this.user()?.rol === 'SUPERUSUARIO' && !this.managingConjuntoId();
    if (isSuper) {
      return {
        isSuper: true,
        conjuntos: this.conjuntos().length,
        residentes: this.residentes().length,
        vehiculos: this.vehiculos().length,
        administradores: this.usuarios().filter(u => u.rol === 'ADMINISTRADOR').length
      };
    } else {
      const cId = this.contextConjuntoId;
      return {
        isSuper: false,
        torres: this.torres().filter(t => t.conjuntoId === cId).length,
        aptos: this.aptos().filter(a => this.torres().some(t => t.id === a.torreId && t.conjuntoId === cId)).length,
        residentes: this.residentes().filter(r => r.conjuntoId === cId).length,
        vehiculos: this.vehiculos().filter(v => v.parqueadero?.conjuntoId === cId || !v.parqueadero).length,
        parqueaderos: this.parqueaderos().filter(p => p.conjuntoId === cId).length
      };
    }
  });

  // Master View Join Computado
  masterData = computed(() => {
    const cId = this.managingConjuntoId() || this.user()?.conjuntoId;
    if (!cId) return [];
    
    // Filtrar data por el conjunto actual
    const currentTorres = this.torres().filter(t => t.conjuntoId === cId);
    const currentAptos = this.aptos().filter(a => currentTorres.some(t => t.id === a.torreId));
    const currentParq = this.parqueaderos().filter(p => p.conjuntoId === cId);
    const currentUsers = this.usuarios().filter(u => u.conjuntoId === cId && u.rol === 'RESIDENTE');

    // Construir tabla cruzada
    const joinTable = currentAptos.map(apto => {
      const torre = currentTorres.find(t => t.id === apto.torreId);
      const parqs = currentParq.filter(p => p.apartamentoId === apto.id);
      
      const vinculados = this.residentes().filter(r => r.apartamentos?.some((ra: any) => ra.apartamentoId === apto.id));
      const resNombres = vinculados.length > 0 ? vinculados.map(v => v.nombre).join(', ') : 'Desocupado';

      const parqIds = parqs.map(p => p.id);
      const vehs = this.vehiculos().filter(v => parqIds.includes(v.parqueaderoId));

      return {
        aptoId: apto.id,
        aptoNumero: apto.numero,
        torreNombre: torre?.nombre || 'N/A',
        parqNumero: parqs.length > 0 ? parqs.map(p => p.numero).join(', ') : 'No Asignado',
        parqTipo: parqs.length > 0 ? parqs.map(p => p.tipo).join(', ') : '-',
        residenteNombre: resNombres,
        vehiculos: vehs.length > 0 ? vehs.map(v => `${v.placa} (${v.tipo || 'CARRO'})`).join(', ') : '0',
        aptoObj: apto,
        parqObj: parqs.length > 0 ? parqs[0] : null,
        resObj: vinculados.length > 0 ? vinculados[0] : null,
        vinculados: vinculados,
        parqs: parqs,
        vehs: vehs
      };
    });

    const term = this.searchTerm().toLowerCase();
    if (!term) return joinTable;

    return joinTable.filter(row => 
      row.aptoNumero.toLowerCase().includes(term) ||
      row.torreNombre.toLowerCase().includes(term) ||
      row.parqNumero.toLowerCase().includes(term) ||
      row.vehiculos.toLowerCase().includes(term) ||
      row.residenteNombre.toLowerCase().includes(term)
    );
  });

  // Modal States
  isConjuntoModalOpen = false;
  isUsuarioModalOpen = false;
  isTorreModalOpen = false;
  isAptoModalOpen = false;
  isParqueaderoModalOpen = false;
  isResidenteModalOpen = false;
  isVehiculoModalOpen = false;
  isWizardOpen = false;
  wizardStep = 1;
  wizardLoading = false;
  isGenerateAccountModalOpen = false;
  
  editingId: number | null = null;
  targetResidenteId: number | null = null; // For generate account

  // Forms
  conjuntoForm: FormGroup = this.fb.group({ nombre: ['', Validators.required], direccion: ['', Validators.required], telefono: [''], contacto: [''] });
  usuarioForm: FormGroup = this.fb.group({ nombre: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: [''], rol: ['ADMINISTRADOR', Validators.required], conjuntoId: [null] });
  torreForm: FormGroup = this.fb.group({ nombre: ['', Validators.required] });
  aptoForm: FormGroup = this.fb.group({ numero: ['', Validators.required], torreId: [null, Validators.required] });
  parqueaderoForm: FormGroup = this.fb.group({ numero: ['', Validators.required], tipo: ['SENCILLO', Validators.required], torreId: [null], apartamentoId: [null] });
  residenteForm: FormGroup = this.fb.group({ nombre: ['', Validators.required], documento: [''], telefono: [''], apartamentoId: [null], tipoResidente: ['PROPIETARIO'] });
  vehiculoForm: FormGroup = this.fb.group({ placa: ['', Validators.required], tipo: ['CARRO', Validators.required], marca: [''], color: [''], parqueaderoId: [null, Validators.required] });
  
  wizardForm: FormGroup = this.fb.group({
    torreId: [null],
    nuevaTorreNombre: [''],
    aptoNumero: ['', Validators.required],
    crearParqueadero: [false],
    parqueaderoNumero: [''],
    parqueaderoTipo: ['SENCILLO'],
    crearVehiculo: [false],
    vehiculoPlaca: [''],
    vehiculoTipo: ['CARRO'],
    crearResidente: [false],
    residenteNombre: [''],
    residenteDocumento: [''],
    residenteTelefono: [''],
    residenteTipo: ['PROPIETARIO']
  });

  generateAccountForm: FormGroup = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });

  ngOnInit() {
    this.loadAllData();
    // Redirect Vigilante to specialized view
    if (this.user()?.rol === 'VIGILANTE') {
      this.view = 'vigilante';
    }
  }

  loadAllData() {
    this.conjuntoService.getAll().subscribe(d => this.conjuntos.set(d));
    this.usuarioService.getAll().subscribe(d => this.usuarios.set(d));
    this.torreService.getAll().subscribe(d => this.torres.set(d));
    this.aptoService.getAll().subscribe(d => this.aptos.set(d));
    this.parqueaderoService.getAll().subscribe(d => this.parqueaderos.set(d));
    this.residenteService.findAll().subscribe(d => this.residentes.set(d));
    this.vehiculoService.findAll().subscribe(d => this.vehiculos.set(d));
  }

  logout() { this.authService.logout(); }

  // --- ADMINISTRAR CONTEXTO ---
  get contextConjuntoId(): number {
    return this.managingConjuntoId() || this.user()?.conjuntoId || 0;
  }

  get contextName(): string {
    const cId = this.contextConjuntoId;
    if (cId) {
      return this.getConjuntoName(cId) || 'Prado Verde';
    }
    return 'Prado Verde';
  }

  manageConjunto(id: number) {
    this.managingConjuntoId.set(id);
    this.view = 'dashboard'; 
  }
  exitManagementMode() {
    this.managingConjuntoId.set(null);
    this.view = 'conjuntos';
  }

  // MÃ©todos genÃ©ricos para abrir modales
  openModal(type: 'conjunto'|'usuario'|'torre'|'apto'|'parqueadero'|'residente'|'vehiculo', entity?: any) {
    this.editingId = entity ? entity.id : null;
    switch(type) {
      case 'conjunto':
        entity ? this.conjuntoForm.patchValue(entity) : this.conjuntoForm.reset();
        this.isConjuntoModalOpen = true; break;
      case 'torre':
        entity ? this.torreForm.patchValue(entity) : this.torreForm.reset();
        this.isTorreModalOpen = true; break;
      case 'apto':
        entity ? this.aptoForm.patchValue(entity) : this.aptoForm.reset();
        this.isAptoModalOpen = true; break;
      case 'parqueadero':
        entity ? this.parqueaderoForm.patchValue(entity) : this.parqueaderoForm.reset({tipo: 'SENCILLO'});
        this.isParqueaderoModalOpen = true; break;
      case 'residente':
        entity ? this.residenteForm.patchValue(entity) : this.residenteForm.reset({tipoResidente: 'PROPIETARIO'});
        this.isResidenteModalOpen = true; break;
      case 'vehiculo':
        entity ? this.vehiculoForm.patchValue(entity) : this.vehiculoForm.reset({tipo: 'CARRO'});
        this.isVehiculoModalOpen = true; break;
      case 'usuario':
        if(entity) {
          this.usuarioForm.patchValue(entity);
          this.usuarioForm.get('password')?.clearValidators();
        } else {
          let defaultRol = 'ADMINISTRADOR';
          if (this.user()?.rol === 'SUPERUSUARIO' && !this.managingConjuntoId()) {
            defaultRol = 'SUPERUSUARIO';
          } else if (this.user()?.rol === 'ADMINISTRADOR') {
            defaultRol = 'VIGILANTE';
          }

          const defaultConj = (this.user()?.rol === 'ADMINISTRADOR' || this.managingConjuntoId()) ? this.contextConjuntoId : null;
          this.usuarioForm.reset({ rol: defaultRol, conjuntoId: defaultConj });
          this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        }
        this.usuarioForm.get('password')?.updateValueAndValidity();
        this.isUsuarioModalOpen = true; break;
    }
  }

  // --- TORRES CRUD ---
  saveTorre() {
    if (this.torreForm.invalid) return;
    const data = this.forceUppercase({ ...this.torreForm.value, conjuntoId: this.contextConjuntoId });
    const req$ = this.editingId ? this.torreService.update(this.editingId, data) : this.torreService.create(data);
    req$.subscribe(() => { this.isTorreModalOpen = false; this.loadAllData(); });
  }
  deleteTorre(id: number) {
    if(confirm('Â¿Eliminar esta torre?')) this.torreService.delete(id).subscribe(() => this.loadAllData());
  }

  // --- APARTAMENTOS CRUD ---
  saveApto() {
    if (this.aptoForm.invalid) return;
    const data = this.forceUppercase({ ...this.aptoForm.value, torreId: Number(this.aptoForm.value.torreId) });
    const req$ = this.editingId ? this.aptoService.update(this.editingId, data) : this.aptoService.create(data);
    req$.subscribe(() => { this.isAptoModalOpen = false; this.loadAllData(); });
  }
  deleteApto(id: number) {
    if(confirm('Â¿Eliminar este apartamento?')) this.aptoService.delete(id).subscribe(() => this.loadAllData());
  }

  // --- PARQUEADEROS CRUD ---
  saveParqueadero() {
    if (this.parqueaderoForm.invalid) return;
    const data = this.forceUppercase({ 
      ...this.parqueaderoForm.value, 
      conjuntoId: this.contextConjuntoId,
      torreId: this.parqueaderoForm.value.torreId ? Number(this.parqueaderoForm.value.torreId) : null,
      apartamentoId: this.parqueaderoForm.value.apartamentoId ? Number(this.parqueaderoForm.value.apartamentoId) : null,
    });
    const req$ = this.editingId ? this.parqueaderoService.update(this.editingId, data) : this.parqueaderoService.create(data);
    req$.subscribe({
      next: () => { this.isParqueaderoModalOpen = false; this.loadAllData(); },
      error: (err) => { alert(err.error?.message || 'Error guardando parqueadero'); console.error(err); }
    });
  }
  deleteParqueadero(id: number) {
    if(confirm('Â¿Eliminar este parqueadero?')) this.parqueaderoService.delete(id).subscribe(() => this.loadAllData());
  }

  // --- RESIDENTES CRUD ---
  saveResidente() {
    if (this.residenteForm.invalid) return;
    const data = this.forceUppercase({ 
      ...this.residenteForm.value, 
      conjuntoId: this.contextConjuntoId 
    });
    const req$ = this.editingId ? this.residenteService.update(this.editingId, data) : this.residenteService.create(data);
    req$.subscribe({
      next: () => { this.isResidenteModalOpen = false; this.loadAllData(); },
      error: (err) => alert(err.error?.message || 'Error al guardar')
    });
  }
  deleteResidente(id: number) {
    if (confirm('Â¿Eliminar este residente?')) {
      this.residenteService.delete(id).subscribe(() => this.loadAllData());
    }
  }

  saveVehiculo() {
    if (this.vehiculoForm.invalid) return;
    const data = this.forceUppercase({ ...this.vehiculoForm.value });
    if (data.parqueaderoId) data.parqueaderoId = Number(data.parqueaderoId);
    
    const action = this.editingId 
      ? this.vehiculoService.update(this.editingId, data)
      : this.vehiculoService.create(data);
      
    action.subscribe(() => {
      this.isVehiculoModalOpen = false;
      this.loadAllData();
    });
  }

  deleteVehiculo(id: number) {
    if (confirm('Â¿Eliminar este vehÃ­culo?')) {
      this.vehiculoService.delete(id).subscribe(() => this.loadAllData());
    }
  }

  openGenerateAccount(residenteId: number) {
    this.targetResidenteId = residenteId;
    this.generateAccountForm.reset();
    this.isGenerateAccountModalOpen = true;
  }

  submitGenerateAccount() {
    if (this.generateAccountForm.invalid || !this.targetResidenteId) return;
    this.residenteService.generateAccount(this.targetResidenteId, this.generateAccountForm.value).subscribe({
      next: () => {
        alert('Cuenta creada exitosamente');
        this.isGenerateAccountModalOpen = false;
        this.loadAllData();
      },
      error: (err) => alert(err.error?.message || 'Error al crear la cuenta')
    });
  }

  // Resto de guardados
  saveConjunto() {
    if (this.conjuntoForm.invalid) return;
    const req$ = this.editingId ? this.conjuntoService.update(this.editingId, this.conjuntoForm.value) : this.conjuntoService.create(this.conjuntoForm.value);
    req$.subscribe(() => { this.isConjuntoModalOpen = false; this.loadAllData(); });
  }

  saveUsuario() {
    if (this.usuarioForm.invalid) return;
    const formData = { ...this.usuarioForm.value };
    if (!formData.password) delete formData.password;
    
    // Si el rol es SUPERUSUARIO, conjuntoId debe ser nulo
    if (formData.rol === 'SUPERUSUARIO') {
      if (this.user()?.rol !== 'SUPERUSUARIO' || this.managingConjuntoId()) {
        alert('Acceso denegado: Un Administrador no puede crear o asignar el rol Superusuario.');
        return;
      }
      formData.conjuntoId = null;
    } else if (this.user()?.rol !== 'SUPERUSUARIO' || this.managingConjuntoId()) {
      formData.conjuntoId = this.contextConjuntoId;
    } else if (formData.conjuntoId) {
      formData.conjuntoId = Number(formData.conjuntoId);
    }

    const req$ = this.editingId ? this.usuarioService.update(this.editingId, formData) : this.usuarioService.create(formData);
    req$.subscribe({
      next: () => { this.isUsuarioModalOpen = false; this.loadAllData(); },
      error: (err) => alert(err.error?.message || 'Error al guardar el usuario')
    });
  }
  
  deleteUsuario(id: number) {
    const target = this.usuarios().find(u => u.id === id);
    if (target?.rol === 'SUPERUSUARIO' && this.user()?.rol !== 'SUPERUSUARIO') {
      alert('Acceso denegado: Solo un Superusuario puede eliminar a otros Superusuarios.');
      return;
    }
    if(confirm('¿Eliminar usuario?')) this.usuarioService.delete(id).subscribe(() => this.loadAllData());
  }

  deleteConjunto(id: number) {
    if(confirm('Â¿Eliminar conjunto?')) this.conjuntoService.delete(id).subscribe(() => this.loadAllData());
  }

  // Helpers
  getConjuntoName(id: number | null): string {
    const conj = this.conjuntos().find(c => c.id === id);
    return conj ? conj.nombre : 'N/A';
  }
  getTorreName(id: number | null): string {
    const t = this.torres().find(c => c.id === id);
    return t ? t.nombre : 'N/A';
  }
  getAptoName(id: number | null): string {
    const a = this.aptos().find(c => c.id === id);
    return a ? a.numero : 'N/A';
  }
  
  get currentTorres() {
    return this.torres().filter(t => t.conjuntoId === this.contextConjuntoId);
  }
  get currentAptos() {
    return this.aptos().filter(a => this.currentTorres.some(t => t.id === a.torreId));
  }
  get currentParqueaderos() {
    return this.parqueaderos().filter(p => p.conjuntoId === this.contextConjuntoId);
  }
  get currentVehiculos() {
    return this.vehiculos().filter(v => v.parqueadero?.conjuntoId === this.contextConjuntoId || !v.parqueadero); // Simplificado
  }
  get currentResidentes() {
    return this.residentes().filter(r => r.conjuntoId === this.contextConjuntoId);
  }

  // --- FILTROS DE BÃšSQUEDA ---
  get filteredTorres() {
    const term = this.searchTerm().toUpperCase();
    return term ? this.currentTorres.filter(t => t.nombre.toUpperCase().includes(term)) : this.currentTorres;
  }
  get filteredAptos() {
    const term = this.searchTerm().toUpperCase();
    return term ? this.currentAptos.filter(a => a.numero.toUpperCase().includes(term) || this.getTorreName(a.torreId).toUpperCase().includes(term)) : this.currentAptos;
  }
  get filteredParqueaderos() {
    const term = this.searchTerm().toUpperCase();
    return term ? this.currentParqueaderos.filter(p => p.numero.toUpperCase().includes(term) || p.tipo.toUpperCase().includes(term) || this.getAptoName(p.apartamentoId).toUpperCase().includes(term)) : this.currentParqueaderos;
  }
  get filteredVehiculos() {
    const term = this.searchTerm().toUpperCase();
    return term ? this.currentVehiculos.filter(v => v.placa.toUpperCase().includes(term) || (v.marca || '').toUpperCase().includes(term) || (v.color || '').toUpperCase().includes(term)) : this.currentVehiculos;
  }
  get filteredResidentes() {
    const term = this.searchTerm().toUpperCase();
    return term ? this.currentResidentes.filter(r => r.nombre.toUpperCase().includes(term) || (r.documento || '').toUpperCase().includes(term) || (r.telefono || '').toUpperCase().includes(term)) : this.currentResidentes;
  }
  get filteredConjuntos() {
    let term = this.searchTerm().toLowerCase();
    let list = this.conjuntos();
    if (this.user()?.rol === 'ADMINISTRADOR') {
      list = list.filter(c => c.id === this.user()?.conjuntoId);
    }
    return term ? list.filter(c => c.nombre.toLowerCase().includes(term)) : list;
  }
  get filteredUsuarios() {
    let data = this.usuarios();
    if (this.user()?.rol !== 'SUPERUSUARIO' || this.managingConjuntoId()) {
      data = data.filter(x => x.conjuntoId === this.contextConjuntoId && x.rol !== 'SUPERUSUARIO');
    }
    const term = this.searchTerm().toUpperCase();
    return term ? data.filter(u => u.nombre.toUpperCase().includes(term) || u.email.toUpperCase().includes(term)) : data;
  }

  get aptosParaParqueadero() {
    const torreId = this.parqueaderoForm.get('torreId')?.value;
    let aptos = this.currentAptos;
    if (torreId) {
      aptos = aptos.filter(a => a.torreId === Number(torreId));
    }
    return aptos;
  }

  // Utilidad para forzar mayÃºsculas en los objetos a guardar
  forceUppercase(obj: any) {
    const copy = { ...obj };
    for (let key in copy) {
      if (typeof copy[key] === 'string' && key !== 'password' && key !== 'email') {
        copy[key] = copy[key].toUpperCase();
      }
    }
    return copy;
  }

  // --- WIZARD LÃ“GICA ---
  openWizard() {
    this.wizardForm.reset({
      parqueaderoTipo: 'SENCILLO',
      vehiculoTipo: 'CARRO',
      crearParqueadero: true,
      crearVehiculo: true,
      crearResidente: true
    });
    this.wizardStep = 1;
    this.wizardLoading = false;
    this.isWizardOpen = true;
  }

  nextWizardStep() { this.wizardStep++; }
  prevWizardStep() { this.wizardStep--; }

  async submitWizard() {
    this.wizardLoading = true;
    try {
      const data = this.forceUppercase(this.wizardForm.value);
      const cId = this.contextConjuntoId;
      
      // 1. Torre
      let tId = data.torreId;
      if (!tId && data.nuevaTorreNombre) {
        const t = await this.torreService.create({ nombre: data.nuevaTorreNombre, conjuntoId: cId }).toPromise();
        tId = t?.id;
      }
      
      // 2. Apto
      const a = await this.aptoService.create({ numero: data.aptoNumero, torreId: tId }).toPromise();
      const aId = a?.id;

      // 3. Parqueadero
      let pId = null;
      if (this.wizardForm.value.crearParqueadero && data.parqueaderoNumero) {
        const p = await this.parqueaderoService.create({ numero: data.parqueaderoNumero, tipo: data.parqueaderoTipo, conjuntoId: cId, apartamentoId: aId, torreId: tId }).toPromise();
        pId = p?.id;
      }

      // 4. VehÃ­culo
      if (this.wizardForm.value.crearVehiculo && pId && data.vehiculoPlaca) {
        await this.vehiculoService.create({ placa: data.vehiculoPlaca, tipo: data.vehiculoTipo, parqueaderoId: pId }).toPromise();
      }

      // 5. Residente
      if (this.wizardForm.value.crearResidente && data.residenteNombre) {
        await this.residenteService.create({ nombre: data.residenteNombre, cedula: data.residenteCedula, telefono: data.residenteTelefono, conjuntoId: cId, apartamentoId: aId, tipoResidente: data.residenteTipo || 'PROPIETARIO' }).toPromise();
      }

      this.isWizardOpen = false;
      this.loadAllData();
      alert('Â¡Ecosistema creado exitosamente!');
    } catch (e: any) {
      alert(e.error?.message || 'OcurriÃ³ un error en la creaciÃ³n');
      console.error(e);
    }
    this.wizardLoading = false;
  }

  exportToExcel() {
    const data = this.masterData();
    let csv = 'APARTAMENTO,TORRE,RESIDENTE,PARQUEADERO,VEHICULOS\n';
    data.forEach(row => {
      const apto = (row.aptoNumero || '').replace(/"/g, '""');
      const torre = (row.torreNombre || '').replace(/"/g, '""');
      const res = (row.residenteNombre || '').replace(/"/g, '""');
      const parq = (row.parqNumero || '').replace(/"/g, '""');
      const veh = (row.vehiculos || '').replace(/"/g, '""');
      csv += `"${apto}","${torre}","${res}","${parq}","${veh}"\n`;
    });
    const blob = new Blob(["\uFEFF"+csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const conjuntoName = this.getConjuntoName(this.contextConjuntoId);
    link.download = `BD_PRADO_VERDE_${conjuntoName}.csv`;
    link.click();
  }

  downloadTemplate() {
    const csv = "TORRE,APARTAMENTO,PARQUEADERO_NUMERO,PARQUEADERO_TIPO,VEHICULO_PLACA,VEHICULO_TIPO,RESIDENTE_NOMBRE,RESIDENTE_CEDULA,RESIDENTE_TELEFONO,RESIDENTE_TIPO\nEjemplo Torre A,101,15,SENCILLO,ABC-123,CARRO,Juan Perez,1085000000,3200000000,PROPIETARIO";
    const blob = new Blob(["\uFEFF"+csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Plantilla_Importacion.csv`;
    link.click();
  }

  async importExcel(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const text = e.target.result;
      const lines = text.split('\n').filter((l: string) => l.trim().length > 0);
      if (lines.length <= 1) return alert('El archivo está vacío o no tiene datos de ejemplo.');
      
      const rows = [];
      // Empezamos desde i=1 para omitir la cabecera
      for (let i = 1; i < lines.length; i++) {
        // Soporta campos separados por coma, limpia espacios y retornos de carro
        const row = lines[i].split(',').map((val: string) => val.trim().replace(/\r/g, ''));
        rows.push({
          torre: row[0], apto: row[1],
          parqNumero: row[2], parqTipo: row[3],
          placa: row[4], vehTipo: row[5],
          resNombre: row[6], resCedula: row[7],
          resTelefono: row[8], resTipo: row[9]
        });
      }

      try {
         const payload = this.forceUppercase({ conjuntoId: this.contextConjuntoId, filas: rows });
         // Usar http request directo (dashboard usa services pero para esto inyectaré HttpClient si no está, 
         // O usar un servicio. Inyectar HttpClient en el constructor o usar fetch puro para no complicar el constructor
         
         const res = await fetch(`${environment.apiUrl}/import`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
           body: JSON.stringify(payload)
         });

         const json = await res.json();
         if (!res.ok) throw new Error(json.message || 'Error importando');
         
         alert('Importación completada con éxito. Se procesaron los registros.');
         this.loadAllData();
      } catch (err: any) {
         alert('Error importando: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  }

  openResidenteModalForApto(aptoId: number) {
    this.editingId = null;
    this.residenteForm.reset({tipoResidente: 'PROPIETARIO', apartamentoId: aptoId});
    this.isResidenteModalOpen = true;
  }
}


