import { Telegraf } from 'telegraf';
import { IBotContext } from '../config/context/context.interface';

export abstract class Command {
	constructor(public bor: Telegraf<IBotContext>) {

	}

	abstract handle(): void;
}

// команда будет обязана получать бота и реализовывать метод handle