import { z } from 'zod';

export const ToolSchemas = [
  {
    type: 'function' as const,
    function: {
      name: 'browser_navigate',
      description: 'Navigates the browser to a specific URL.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The absolute URL to navigate to (e.g., "https://example.com").',
          },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'browser_click',
      description:
        'Clicks an interactive element using its reference ID from the accessibility snapshot.',
      parameters: {
        type: 'object',
        properties: {
          ref: {
            type: 'string',
            description: 'The unique reference ID of the element to click (e.g. "v1:e3").',
          },
          element: {
            type: 'string',
            description: 'Brief human-readable description of the element for verification and logging.',
          },
          button: {
            type: 'string',
            enum: ['left', 'right', 'middle'],
            description: 'Mouse button to click with. Defaults to "left".',
          },
          clickCount: {
            type: 'number',
            description: 'Number of clicks (1 for single, 2 for double click). Defaults to 1.',
          },
        },
        required: ['ref'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'browser_type',
      description: 'Types text into an editable input or textarea element designated by its ref.',
      parameters: {
        type: 'object',
        properties: {
          ref: {
            type: 'string',
            description: 'The unique reference ID of the input field (e.g. "v1:e5").',
          },
          text: {
            type: 'string',
            description: 'The text string to type into the field.',
          },
          clear: {
            type: 'boolean',
            description: 'Whether to clear existing text before typing. Defaults to false.',
          },
          pressEnter: {
            type: 'boolean',
            description: 'Whether to press Enter after typing. Defaults to false.',
          },
        },
        required: ['ref', 'text'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'browser_fill_form',
      description: 'Fills multiple form fields in one batch action.',
      parameters: {
        type: 'object',
        properties: {
          fields: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ref: { type: 'string', description: 'Reference ID of the input field.' },
                value: { type: 'string', description: 'Value to fill in.' },
              },
              required: ['ref', 'value'],
            },
            description: 'List of field reference IDs and values to populate.',
          },
        },
        required: ['fields'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'browser_hover',
      description: 'Hovers the mouse over an element identified by its ref.',
      parameters: {
        type: 'object',
        properties: {
          ref: {
            type: 'string',
            description: 'The reference ID of the element to hover over.',
          },
        },
        required: ['ref'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'browser_press_key',
      description: 'Presses a keyboard key (e.g. Enter, Escape, Tab, ArrowDown, Backspace).',
      parameters: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'The key to press (e.g. "Enter", "Tab", "Escape").',
          },
        },
        required: ['key'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'browser_select_option',
      description: 'Selects an option from a dropdown combobox element.',
      parameters: {
        type: 'object',
        properties: {
          ref: {
            type: 'string',
            description: 'The reference ID of the select element.',
          },
          value: {
            type: 'string',
            description: 'The option label or value to select.',
          },
        },
        required: ['ref', 'value'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'browser_wait_for',
      description: 'Waits for a period of time or for specific text to become visible on the page.',
      parameters: {
        type: 'object',
        properties: {
          ms: {
            type: 'number',
            description: 'Milliseconds to wait (min 100, max 10000).',
          },
          text: {
            type: 'string',
            description: 'Optional text string to wait for before proceeding.',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'browser_snapshot',
      description: 'Forces an immediate fresh accessibility snapshot of the current page.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'desktop_write_note',
      description:
        'Writes task notes, summaries, or audit logs to a local file in data/outputs. Only set openInNotepad to true if the user explicitly asked to open or show Notepad.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Short descriptive title for the note.',
          },
          content: {
            type: 'string',
            description: 'Complete formatted note text or summary.',
          },
          openInNotepad: {
            type: 'boolean',
            description: 'Whether to launch desktop Notepad. Defaults to false. Set to true ONLY if user explicitly asked to open Notepad.',
          },
        },
        required: ['title', 'content'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'desktop_launch_app',
      description:
        'Launches an authorized desktop application utility (e.g. "notepad", "calc", "explorer").',
      parameters: {
        type: 'object',
        properties: {
          app: {
            type: 'string',
            description: 'Application to launch (e.g. "notepad", "calc", "explorer").',
          },
          targetPath: {
            type: 'string',
            description: 'Optional file or folder path for the application to open.',
          },
        },
        required: ['app'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'desktop_reveal_file',
      description: 'Reveals and selects an output or report file in the desktop file manager (Windows Explorer).',
      parameters: {
        type: 'object',
        properties: {
          filePath: {
            type: 'string',
            description: 'Path to the file to highlight in Windows Explorer / desktop file manager.',
          },
        },
        required: ['filePath'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'file_read',
      description: 'Safely reads content from a local file (JSON, CSV, text).',
      parameters: {
        type: 'object',
        properties: {
          filePath: {
            type: 'string',
            description: 'Relative or absolute path to the local file.',
          },
          maxLines: {
            type: 'number',
            description: 'Maximum number of lines to return. Defaults to 100.',
          },
        },
        required: ['filePath'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'file_list_directory',
      description: 'Lists all files and subfolders in a local directory or local drive (e.g. "D:\\", "D:\\Downloads", "./data").',
      parameters: {
        type: 'object',
        properties: {
          dirPath: {
            type: 'string',
            description: 'Target directory or drive path to list (e.g. "D:\\" or "C:\\Users\\...").',
          },
          maxItems: {
            type: 'number',
            description: 'Maximum number of files to return in listing. Defaults to 100.',
          },
        },
        required: ['dirPath'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'file_organize_directory',
      description: 'Actually organizes files in a target directory or drive (e.g. "D:\\" or a folder) into clean category folders (Documents, Images, Videos, Audio, Archives, Code, Installers). Moves real files into respective folders on disk.',
      parameters: {
        type: 'object',
        properties: {
          dirPath: {
            type: 'string',
            description: 'Target directory or drive to organize (e.g. "D:\\" or "D:\\Downloads").',
          },
        },
        required: ['dirPath'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'file_organize_smart',
      description: 'Semantically organizes files in a directory or local drive by inspecting inside file contents (text, PDFs, CSVs, documents) and clustering into smart topical folders (e.g., AWS_Invoices, Tax_and_Compliance, Resumes_and_Careers, Healthcare_and_Research, Contracts_and_Legal) rather than merely grouping by extension. Generates an undo manifest.',
      parameters: {
        type: 'object',
        properties: {
          dirPath: {
            type: 'string',
            description: 'Target directory or drive path to organize semantically by content.',
          },
          dryRun: {
            type: 'boolean',
            description: 'If true, simulates organization without moving files.',
          },
        },
        required: ['dirPath'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'file_rename_folder_by_content',
      description: 'Inspects all documents and files inside a folder, determines the dominant content/topic consensus (e.g. AWS Invoices, Clinical Research, Tax Documents), and renames the folder on disk to accurately reflect what is stored inside.',
      parameters: {
        type: 'object',
        properties: {
          folderPath: {
            type: 'string',
            description: 'Target folder path to inspect and rename based on content.',
          },
        },
        required: ['folderPath'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'file_undo_organize',
      description: 'Safely reverses a previously executed file organization operation by reading its transactional undo manifest and moving all files back to their exact original locations.',
      parameters: {
        type: 'object',
        properties: {
          manifestPath: {
            type: 'string',
            description: 'Path to the organizer-manifest JSON file.',
          },
        },
        required: ['manifestPath'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'file_move',
      description: 'Moves or renames a file or directory from sourcePath to destinationPath.',
      parameters: {
        type: 'object',
        properties: {
          sourcePath: {
            type: 'string',
            description: 'Source file or folder path.',
          },
          destinationPath: {
            type: 'string',
            description: 'Destination file or folder path.',
          },
        },
        required: ['sourcePath', 'destinationPath'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'file_create_directory',
      description: 'Creates a directory or folder at the specified path.',
      parameters: {
        type: 'object',
        properties: {
          dirPath: {
            type: 'string',
            description: 'Directory path to create.',
          },
        },
        required: ['dirPath'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'browser_done',
      description: 'Concludes the task when the objective has been fully achieved or answered.',
      parameters: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description: 'Executive summary of actions taken.',
          },
          finalAnswer: {
            type: 'string',
            description: 'Complete, structured final answer fulfilling the user goal.',
          },
          sources: {
            type: 'array',
            items: { type: 'string' },
            description: 'URLs visited or cited in the response.',
          },
        },
        required: ['summary', 'finalAnswer'],
      },
    },
  },
];

export const ToolCallValidation = z.object({
  name: z.string(),
  arguments: z.record(z.any()),
});
