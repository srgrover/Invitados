import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Persona } from '../models/Persona';
import { Grupo } from '../models/Grupo';

import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private ruta!: string;
  private ruta$!: Subject<string>;
  invitados!: Observable<Persona[]>;
  grupos!: Observable<Grupo[]>;
  private invitadoCollection!: AngularFirestoreCollection<Persona>;
  private grupoCollection!: AngularFirestoreCollection<Grupo>;
  

  constructor(private readonly afs: AngularFirestore, private router: Router) {
    this.ruta$ = new Subject();
    this.invitadoCollection = afs.collection<Persona>('personas');
    this.grupoCollection = afs.collection<Grupo>('grupos');
    this.setRuta();
    this.getGrupos();
    this.getInvitados();
  }

  addInvitado(invitado: Persona): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        invitado.id = invitado.id || this.afs.createId();
        const result = await this.invitadoCollection.doc(invitado.id).set(invitado);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  private async getInvitados(): Promise<void> {
    this.invitados = await this.invitadoCollection
      .snapshotChanges()
      .pipe(
        map((actions) => actions.map((a) => a.payload.doc.data() as Persona))
      );
  }

  deleteInvitado(id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.invitadoCollection.doc(id).delete();
        resolve(result);
      } catch (err) {
        reject(err)
      }
    });
  }

  addGrupo(grupo: Grupo): Promise<void> {
    console.log(grupo);
    
    return new Promise(async (resolve, reject) => {
      try {
        grupo.id = grupo.id || this.afs.createId();
        const result = await this.grupoCollection.doc(grupo.id).set(grupo);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  private async getGrupos(): Promise<void> {
    this.grupos = await this.grupoCollection
      .snapshotChanges()
      .pipe(
        map((actions) => actions.map((a) => a.payload.doc.data() as Grupo))
      );
  }

  deleteGrupo(id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.grupoCollection.doc(id).delete();
        resolve(result);
      } catch (err) {
        reject(err)
      }
    });
  }

  setRuta(){
    this.ruta = this.router.url;
    this.ruta$.next(this.ruta);
  }

  getRuta(): Observable<string>{
    return this.ruta$.asObservable();
  }
}
