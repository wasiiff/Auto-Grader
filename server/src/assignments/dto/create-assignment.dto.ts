export class CreateAssignmentDto {
  title: string;
  minWords: number;
  mode: 'strict' | 'loose';
  description?: string;
}
