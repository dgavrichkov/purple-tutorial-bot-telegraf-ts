import { session, Telegraf } from 'telegraf';
import { ConfigService } from './config/config.service';
import { IConfigService } from './config/config.interface';
import { IBotContext } from './config/context/context.interface';
import { Command } from './commands/command.class';

class Bot {
	bot: Telegraf<IBotContext>;
	commands: Command[] = [];

	constructor(private readonly configService: IConfigService) {
		this.bot = new Telegraf<IBotContext>(this.configService.get('TOKEN'));
		this.bot.use(session())
	}

	init() {
		for(const command of this.commands) {
			command.handle
		}
		this.bot.launch();
	}
}

const bot = new Bot(new ConfigService());
bot.init();