import { DataService } from '../../services/data.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Persona } from '../../models/Persona';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Grupos } from 'src/assets/grupos';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  providers: [DataService],
})
export class FormComponent implements OnInit {
  sexoList: any = [];
  parentescoList: any = [];
  states: any;
  stateForm: number = 0
  sexoInvitado: string;
  parentescoInvitado: string;
  grupoInvitado: number;
  invitadoForm!: FormGroup;
  urlTree: any;
  persona: any;
  grupos: any;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    var navi = this.router.getCurrentNavigation();
    this.persona = navi?.extras?.state;
    this.states = { new: 1, edit: 2 };
    this.stateForm = this.getState();
    this.sexoList = ["Hombre", "Mujer"];
    this.parentescoList = ["Padre", "Madre", "Hermano/a", "Tio/a", "Primo/a", "Abuelo/a", "Amigo/a", "Otro"];
    this.sexoInvitado = this.persona?.sexo || "";
    this.parentescoInvitado = this.persona?.parentesco || "";
    this.grupoInvitado = this.persona?.grupo || "";
    this.grupos = Grupos;

    this.initForm();
  }

  ngOnInit(): void {
    if(this.stateForm === this.states.edit){
      this.invitadoForm.patchValue(this.persona);
    }
  }

  async onSave(): Promise<void> {
    if (this.invitadoForm.valid) {
      try {
        const invitado: Persona = this.invitadoForm.value;
        invitado.id = this.persona?.id || null
        await this.dataService.addInvitado(invitado);

        if(this.stateForm == this.states.new){          
          //Swal.fire('Invitado añadido', 'Puedes verlo en la lista', 'success');
          this.openSnackBar('Invitado añadido correctamente','Ok','bg-success')
          this.invitadoForm.reset();
          this.initForm();
        } else if(this.stateForm == this.states.edit){
          //Swal.fire('Invitado editado', 'Pulsa Ok Para volver a la lista', 'success');
          this.openSnackBar('Invitado Editado correctamente','Ok','bg-success')
          this.router.navigate(['home']);
        }

        this.invitadoForm.controls['invitado'].markAsTouched();
        console.log("🚀 ~ file: form.component.ts ~ line 65 ~ FormComponent ~ onSave ~ this.invitadoForm.controls['invitado']", this.invitadoForm.controls['invitado'])
        this.invitadoForm.controls['confirmado'].markAsTouched();
      } catch (e) {
        console.error(e);
      }
    } else {
      //Swal.fire('Oops...', 'Comprueba los datos del formulario', 'error');
      this.openSnackBar('Oops... Comprueba los datos del formulario','Ok','bg-danger')
    }
  }

  isValidField(field: string): string {
    const validatedField = this.invitadoForm.get(field);
    return !validatedField?.valid && validatedField?.touched
      ? 'is-invalid'
      : validatedField?.touched
      ? 'is-valid'
      : '';
  }

  notRequiredHasValue(field: string): string {
    return this.invitadoForm.get(field)?.value ? 'is-valid' : '';
  }

  private initForm(): void {
    this.invitadoForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidos: [''],
      sexo: ['Hombre', [Validators.required]],
      parentesco: ['Padre', [Validators.required]],
      ubicacion: [''],
      invitado: [false, [Validators.required]],
      confirmado: [false, [Validators.required]],
      grupo: [1, [Validators.required]],
    });
  }

  getState(): number {    
    return this.persona && typeof(this.persona !== undefined) ? 2 : 1;
  }

  async goToDelete(id: string){
    try {
      await this.dataService.deleteInvitado(id);
      //Swal.fire('Invitado eliminado', 'Se ha eliminado el invitado correctamente', 'success');
      this.openSnackBar('Invitado eliminado correctamente','Ok','bg-success')
      this.router.navigate(['home']);
    } catch (err) {
      //Swal.fire('Oops...', 'Hubo un error al eliminar al invitado', 'error');
      this.openSnackBar('Oops...Hubo un error al eliminar al invitado','Ok','bg-danger')
    } 
  }

  openSnackBar(message: string, action: string, type: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: [type]
    });
  }
}


