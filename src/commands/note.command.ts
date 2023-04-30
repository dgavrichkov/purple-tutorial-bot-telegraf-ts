import { Telegraf } from "telegraf";
import { sendMessageToNotionDatabase } from "../api/notion/notion";
import { IBotContext } from "../context/context.interface";
import { Command } from "./command.class";

export class NoteCommand extends Command {
  constructor(bot: Telegraf<IBotContext>) {
    super(bot);
  }

  handle(): void {
    this.bot.command("note", (ctx) => {
      ctx.reply("we will save that note on temporary array");
      ctx.session.isNoteCommand = true;
    });

    this.bot.on("text", async (ctx) => {
      if (ctx.session.isNoteCommand) {
        const phrase = await sendMessageToNotionDatabase(ctx.message.text);

        ctx.reply(phrase);
        ctx.session.isNoteCommand = false;
      }
    });
  }
}
