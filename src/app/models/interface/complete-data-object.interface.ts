import {FearAndGreedName} from "../enum/fear-and-greed-name.enum";

export interface CompleteDataObject {
  fngValueName: FearAndGreedName;
  fngValue: string;
  btcPrice: number;
  date: Date;
}
