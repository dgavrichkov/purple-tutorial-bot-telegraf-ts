import { Client } from "@notionhq/client";
import {
  CreatePageParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { format } from "date-fns";
import { ConfigService } from "../../config/config.service";
import { buildTableForNote, buildTableRowForNote } from "./utils";

export class NotionAPI {
  notionKey: string;
  databaseId: string;
  notion: Client;

  constructor() {
    const configService = new ConfigService();
    this.notionKey = configService.get("NOTION_KEY");
    this.databaseId = configService.get("NOTION_DB_KEY");
    this.notion = new Client({ auth: this.notionKey });
  }

  init() {
    console.log("notion class started");
  }

  async findTodayPage(databaseId: string): Promise<null | PageObjectResponse> {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { results } = await this.notion.databases.query({
        database_id: databaseId,
        sorts: [
          {
            property: "Created",
            direction: "descending",
          },
        ],
        page_size: 1,
      });

      const lastEntryDate = format(
        new Date((results[0] as PageObjectResponse).created_time),
        "yyyy-MM-dd"
      );

      if (lastEntryDate === today) {
        return results[0] as PageObjectResponse;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async createDiaryNote(noteText: string) {
    try {
      const currentDate = new Date();
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      const currentTime = format(currentDate, "HH:mm");

      const todayRecord = await this.findTodayPage(this.databaseId);

      const newPageQuery: CreatePageParameters = {
        parent: {
          database_id: this.databaseId,
        },
        icon: {
          type: "emoji",
          emoji: "🥬",
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: `Diary ${formattedDate}`,
                },
              },
            ],
          },
        },
        children: buildTableForNote(noteText, currentTime),
      };

      if (!todayRecord) {
        const response = await this.notion.pages.create(newPageQuery);
        console.log("RESPONSE", response);
        return "Заметка добавлена";
      } else {
        const blocks = await this.notion.blocks.children.list({
          block_id: todayRecord.id,
        });
        const table_block_id = blocks.results[0].id;
        console.log("BLOCKS", blocks);

        await this.notion.blocks.children.append({
          block_id: table_block_id,
          children: [buildTableRowForNote(noteText, currentTime)],
        });
        return `Текст добавлен в сегодняшнюю заметку`;
      }
    } catch (error) {
      console.error(error);
    }
    return "We failed";
  }
}
