import { Telegraf } from "telegraf";
import LocalSession from "telegraf-session-local";
import { ConfigService } from "./config/config.service";
import { IConfigService } from "./config/config.interface";
import { IBotContext } from "./context/context.interface";
import { Command } from "./commands/command.class";
import { StartCommand } from "./commands/start.command";
import { NoteCommand } from "./commands/note.command";
import { NotionAPI } from "./api/notion/notion";

class Bot {
  bot: Telegraf<IBotContext>;
  commands: Command[] = [];

  constructor(private readonly configService: IConfigService) {
    this.bot = new Telegraf<IBotContext>(this.configService.get("TOKEN"));
    this.bot.use(new LocalSession({ database: "sessions.json" }).middleware());
  }

  init() {
    console.log("app initialized");
    // i should initialize notion api instance here
    const notionApi = new NotionAPI();
    notionApi.init();

    this.commands = [
      new StartCommand(this.bot),
      new NoteCommand(this.bot, notionApi),
    ];

    for (const command of this.commands) {
      command.handle();
    }

    this.bot.launch();
  }
}

const bot = new Bot(new ConfigService());
bot.init();
