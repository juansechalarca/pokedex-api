import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  private defaultLimit: number;
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    console.log(process.env.DEFAULT_LIMIT);
    this.defaultLimit = this.configService.get<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (err) {
      this.handleException(err);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return this.pokemonModel
      .find()
      .limit(limit) //Numero de registros que quiero que se muestren
      .skip(offset) //Numero de reguistros que quiro que se salte
      .sort({
        no: 1,
      }) // Ordena de forma accendete por la columna no
      .select('-__v'); //Quita la columna __v de la consulta
  }

  async findOne(id: string) {
    let pokemon: Pokemon;

    if (!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({ no: id });
    }

    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: id.toLocaleLowerCase(),
      });
    }

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or no ${id} not found`,
      );
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(term);

      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
      }

      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (err) {
      this.handleException(err);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    //const result = this.pokemonModel.findByIdAndDelete(id);

    const { deletedCount } = await this.pokemonModel.deleteMany({
      _id: id,
    });

    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${id} not found"`);
    }

    return;
  }

  private handleException(err: any) {
    if (err.code === 11000) {
      throw new BadRequestException(
        `Pokemon existe in db ${JSON.stringify(err.keyValue)}`,
      );
    }
    console.log(err);
    throw new InternalServerErrorException(
      `Can't create Pokemon, check server logs`,
    );
  }
}
