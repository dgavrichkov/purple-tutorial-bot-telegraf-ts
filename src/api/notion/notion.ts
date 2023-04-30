import { Client } from "@notionhq/client";
import { format } from "date-fns";
import {
  MultiSelect,
  CreatedTime,
} from "notion-api-types/responses/properties/database";
import { ConfigService } from "../../config/config.service";

const configService = new ConfigService();
const notionKey = configService.get("NOTION_KEY");
const notionDbKey = configService.get("NOTION_DB_KEY");

const notion = new Client({ auth: notionKey });

interface IDatabaseResult {
  object: string;
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    object: string;
    id: string;
  };
  last_edited_by: {
    object: string;
    id: string;
  };
  icon: {
    type: string;
    emoji: string;
  };
  parent: {
    type: string;
    database_id: string;
  };
  archived: boolean;
  properties: {
    Name: any;
    Tags: MultiSelect;
    Created: CreatedTime;
  };
  url: string;
}

// Функция проверки существования страницы за текущий день
export async function checkTodayRecord(): Promise<null | IDatabaseResult> {
  // Получаем сегодняшнюю дату в формате YYYY-MM-DD

  try {
    // Получаем список страниц, отфильтрованных по заданным параметрам
    const today = format(new Date(), "yyyy-MM-dd");
    const { results } = await notion.databases.query({
      database_id: notionDbKey,
      sorts: [
        {
          property: "Created",
          direction: "descending",
        },
      ],
      page_size: 1, // Запрашиваем только одну запись
    });

    const lastEntryDate = format(
      new Date((results[0] as IDatabaseResult).created_time),
      "yyyy-MM-dd"
    );

    if (lastEntryDate === today) {
      return results[0] as IDatabaseResult;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function addTextToPage(pageId: string, text: string) {
  const newBlock = {
    paragraph: {
      rich_text: [
        {
          text: {
            content: text,
          },
        },
      ],
    },
  };
  await notion.blocks.children.append({
    block_id: pageId,
    children: [newBlock],
  });
}

export async function sendMessageToNotionDatabase(
  message: string
): Promise<string> {
  try {
    const currentDate = new Date();
    const formattedDate = format(currentDate, "yyyy-MM-dd");
    const currentTime = format(currentDate, "HH:mm");

    const todayRecord = await checkTodayRecord();

    if (!todayRecord) {
      const response = await notion.pages.create({
        parent: {
          database_id: notionDbKey,
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
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",

                  text: {
                    content: `${currentTime} - ${message}`,
                  },
                },
              ],
            },
          },
        ],
      });
      console.log("RESPONSE", response);
      return "Запись добавлена";
    } else {
      addTextToPage(todayRecord.id, `${currentTime} - ${message}`);
      return `Текст должнен быть добавлен в запись ${todayRecord.id}`;
    }
  } catch (error) {
    console.error(error);
  }
  return "We failed";
}
