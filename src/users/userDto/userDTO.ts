
export class UserDTO {
  readonly email:string ;
  readonly password:string;
  readonly nom:string;
  readonly prenom:string;
  readonly username:string;
  readonly chefId?: number; 
  readonly subordinatesIds?: number[]; 
}