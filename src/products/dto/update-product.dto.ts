import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  public id: number;
}
