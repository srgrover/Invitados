import { SexoEnum } from './../../shared/Enum/SexoEnum';
import { QueryEnum } from '../../shared/Enum/QueryEnum';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DataService } from './../../shared/services/data.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Persona } from 'src/app/shared/models/Persona';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  public queryList = QueryEnum;

  public tabList = ["Todos", "Hombres", "Mujeres", "Invitados", "Confirmados", "Rechazados"];

  myControl = new FormControl();

  @ViewChild('formSearch')
  menuElement!: MatFormField;

  @ViewChild('formSearchContainer')
  formSearchContainer!: ElementRef;

  elementPosition: any;
  sticky: boolean = false;
  isSearching: boolean = false;

  options: Persona[] = [];
  filteredOptions!: Observable<Persona[]>;

  invitados!: Persona[];
  invitadosFilter: Persona[] = [];
  grupos: any;
  numInvitados: number = 0;
  invitadosHombre!: Persona[];
  invitadosMujer!: Persona[];
  invitadosEnviado!: Persona[];
  invitadosConfirmado!: Persona[];
  invitadosRechazado!: Persona[];

  invitadosListTabs:any = []

  navExtras: NavigationExtras = {
    state: {
      persona: null
    }
  }
  
  @HostListener('window:scroll', ['$event'])
  handleScroll(){
    const windowScroll = window.pageYOffset;
    //console.log("🚀 ~ file: home.component.ts ~ line 46 ~ HomeComponent ~ handleScroll ~ windowScroll", windowScroll)
    this.sticky = windowScroll >= this.elementPosition + 120;
  }

  constructor(private dataService: DataService, private router: Router, private auth: AuthService) {}

  ngAfterViewInit(){
    this.elementPosition = this.formSearchContainer.nativeElement.offsetTop;
    //console.log("🚀 ~ file: home.component.ts ~ line 60 ~ HomeComponent ~ ngAfterViewInit ~ this.menuElement.underlineRef.nativeElement.offsetTop", this.formSearchContainer.nativeElement.offsetTop)
  }

  async ngOnInit(): Promise<void> {
    await this.getInvitados();
  }

  tabLoadTimes: Date[] = [];

  getTimeLoaded(index: number) {
    if (!this.tabLoadTimes[index]) {
      this.tabLoadTimes[index] = new Date();
    }

    return this.tabLoadTimes[index];
  }

  getInvitados(){
    this.dataService.invitados.subscribe((invitados: Persona[]) => {
      this.invitados = invitados;
      this.numInvitados = invitados.length;
      this.invitadosHombre = invitados.filter(x => x.sexo == "Hombre");
      this.invitadosMujer = invitados.filter(x => x.sexo == "Mujer");
      this.invitadosEnviado = invitados.filter(x => x.invitado == true);
      this.invitadosConfirmado = invitados.filter(x => x.confirmado == true);
      this.invitadosRechazado = invitados.filter(x => x.rechazado == true);

      this.invitadosListTabs = [this.invitados, this.invitadosHombre, this.invitadosMujer, this.invitadosEnviado, this.invitadosConfirmado, this.invitadosRechazado];

      this.options = invitados;
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    });
  }

  goToNew(){
    this.router.navigate(['new']);
  }

  goToEdit(persona: Persona){
    if(this.navExtras.state) this.navExtras.state = persona;
    this.router.navigate(['edit'], this.navExtras);
  }

  onDelete(id: string){
    this.dataService.deleteInvitado(id)
  }

  private _filter(value: string): Persona[] {
    const filterValue = value?.toLowerCase();   
    return this.invitados.filter(option => option.nombre.toLowerCase().includes(filterValue) || option.apellidos?.toLowerCase().includes(filterValue));
  }

  filterInvitados(e: any){
    this.isSearching = true;
    this.invitadosFilter = this.invitados.filter(x => x.id === e);
  }

  loadInvitados(e: any){
    var query: string | undefined = undefined;
    var value: any;

    if(e.tab.textLabel == SexoEnum.hombre + "s" || e.tab.textLabel == SexoEnum.mujer + "es"){
      query = QueryEnum.sexo;
      value = e.tab.textLabel
    } 
    else if(e.tab.textLabel != 'Todos'){
      query = e.tab.textLabel.toLowerCase();
      value = true;
    }
    
    this.dataService.getInvitados();
    this.getInvitados();
  }

  clearSearch(){
    this.isSearching = false;
    this.invitadosFilter = [];
    this.myControl.reset();
  }
}