import { IsEnum, IsNotEmpty } from 'class-validator';
import { FileFlag } from '../../../enums/file-flag.enum';
import { AdminReviewComment } from '../../../enums/admin-review-comment.enum';

export class ReviewFileDTO {
  @IsNotEmpty()
  @IsEnum(FileFlag)
  fileFlag: FileFlag = FileFlag.SAFE;

  @IsNotEmpty()
  admin_review_comment: string = AdminReviewComment.FILE_OKAY;
}
