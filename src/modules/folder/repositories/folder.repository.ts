import { EntityRepository, Repository } from "typeorm";
import { Folder } from "../entities/folder.entity";

@EntityRepository(Folder) 
export class FolderRepository extends Repository<Folder> {}