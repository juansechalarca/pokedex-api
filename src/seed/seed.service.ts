import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>(
      'http://pokeapi.co/api/v2/pokemon?limit=650',
    );
    //Primera forma de insertar en bloque
    // const insertPromisesArray = [];
    // data.results.forEach(({ name, url }) => {
    //   insertPromisesArray.push(
    //     this.pokemonModel.create({
    //       no: +url.split('/').splice(-2).shift(),
    //       name,
    //     }),
    //   );
    // });

    // await Promise.all(insertPromisesArray);

    //Segunda forma de insertar en bloque y mas optima

    const pokemonToInsert: { name: string; no: number }[] = [];
    data.results.forEach(({ name, url }) => {
      let no = +url.split('/').splice(-2).shift();
      pokemonToInsert.push({
        no,
        name,
      });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'Seed executed';
  }
}
