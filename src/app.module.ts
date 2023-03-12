import { join } from 'path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    //Permite que se visualice el index.html 
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public')
    }),
    //Cadena de conexion a la base de datos
    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'),
    PokemonModule,
    CommonModule
  ],
  
})
export class AppModule {}