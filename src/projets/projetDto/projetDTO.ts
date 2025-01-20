import { ProjetStatus } from '../projet/ProjetStatus';

export class ProjetDTO {
    readonly nom: string;
    readonly description?: string;
    readonly teamId?: number;
    readonly status?: ProjetStatus;
}

