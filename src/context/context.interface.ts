import { Context } from "telegraf";

export interface ISessionData {
  courseLike: boolean;
  isNoteCommand: boolean;
}

export interface IBotContext extends Context {
  session: ISessionData;
}
