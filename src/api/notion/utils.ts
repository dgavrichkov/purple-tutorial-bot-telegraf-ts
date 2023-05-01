import { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";

export const buildTableRowForNote = (
  text: string,
  time: string
): BlockObjectRequest => {
  return {
    type: "table_row",
    table_row: {
      cells: [
        [
          {
            type: "text",
            text: {
              content: text,
            },
          },
        ],
        [
          {
            type: "text",
            text: {
              content: time,
            },
          },
        ],
      ],
    },
  };
};

export const buildTableForNote = (
  text: string,
  time: string
): BlockObjectRequest[] => {
  return [
    {
      object: "block",
      type: "table",
      table: {
        table_width: 2,
        has_column_header: true,
        has_row_header: false,
        children: [
          {
            type: "table_row",
            table_row: {
              cells: [
                [
                  {
                    type: "text",
                    text: {
                      content: "Note",
                    },
                  },
                ],
                [
                  {
                    type: "text",
                    text: {
                      content: "Time",
                    },
                  },
                ],
              ],
            },
          },
          {
            type: "table_row",
            table_row: {
              cells: [
                [
                  {
                    type: "text",
                    text: {
                      content: text,
                    },
                  },
                ],
                [
                  {
                    type: "text",
                    text: {
                      content: time,
                    },
                  },
                ],
              ],
            },
          },
        ],
      },
    },
  ];
};
