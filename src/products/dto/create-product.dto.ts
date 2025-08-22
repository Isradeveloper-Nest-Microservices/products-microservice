import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @IsNotEmpty()
  public price: number;
}
