import { Telegraf } from "telegraf";
import { NotionAPI } from "../api/notion/notion";
import { IBotContext } from "../context/context.interface";
import { Command } from "./command.class";

export class NoteCommand extends Command {
  notion: NotionAPI;

  constructor(bot: Telegraf<IBotContext>, notion: NotionAPI) {
    super(bot);
    this.notion = notion;
  }

  handle(): void {
    this.bot.command("note", (ctx) => {
      ctx.reply("Введите текст заметки");
      ctx.session.isNoteCommand = true;
    });

    this.bot.on("text", async (ctx) => {
      if (ctx.session.isNoteCommand) {
        const phrase = await this.notion.createDiaryNote(ctx.message.text);

        ctx.reply(phrase);
        ctx.session.isNoteCommand = false;
      }
    });
  }
}
