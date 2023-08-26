import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { FileFlag } from '../../../enums/file-flag.enum';
import { AdminReviewComment } from '../../../enums/admin-review-comment.enum';

export class ReviewFileDTO {
  @IsNotEmpty()
  @IsEnum(FileFlag)
  fileFlag: FileFlag = FileFlag.SAFE;

  @IsNotEmpty()
  admin_review_comment: string = AdminReviewComment.FILE_OKAY;

  @IsOptional()
  @IsNumber()
  unsafe_count: number;
}
