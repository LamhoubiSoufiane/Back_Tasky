
export class TacheDTO {
    nom: string;
    description: string;
    startDate: string;
    endDate: string;
    status?: 'a faire' | 'en cours' | 'terminé' | 'annulé';
    priorite?: 'basse' | 'normale' | 'haute' | 'critique';
    memberId: number;
    locations?: { latitude: number; longitude: number }[];
}