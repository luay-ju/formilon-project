import {
  LuType,
  LuText,
  LuCircle,
  LuSquareCheck,
  LuChevronDown,
  LuHash,
  LuMail,
  LuPhone,
  LuLink,
  LuCalendar,
  LuChartBar,
  LuStar,
  LuList,
  LuSmile,
} from "react-icons/lu";

export const FORM_ELEMENTS = [
  {
    id: "short_text",
    label: "Kurze Antwort",
    icon: <LuType size={16} />,
    type: "short_text",
    description: "Für kurze Textantworten",
  },
  {
    id: "long_text",
    label: "Lange Antwort",
    icon: <LuText size={16} />,
    type: "long_text",
    description: "Für ausführliche Textantworten",
  },
  {
    id: "multiple_choice",
    label: "Multiple Choice",
    icon: <LuCircle size={16} />,
    type: "multiple_choice",
    description: "Einzelauswahl aus Optionen",
  },
  {
    id: "checkboxes",
    label: "Kontrollkästchen",
    icon: <LuSquareCheck size={16} />,
    type: "checkboxes",
    description: "Mehrfachauswahl aus Optionen",
  },
  {
    id: "dropdown",
    label: "Dropdown-Liste",
    icon: <LuChevronDown size={16} />,
    type: "dropdown",
    description: "Auswahl aus einer Dropdown-Liste",
  },
  {
    id: "multi_select",
    label: "Mehrfachauswahl",
    icon: <LuList size={16} />,
    type: "multi_select",
    description: "Mehrere Auswahlmöglichkeiten aus Dropdown",
  },
  {
    id: "number",
    label: "Zahl",
    icon: <LuHash size={16} />,
    type: "number",
    description: "Nur Zahleneingabe",
  },
  {
    id: "email",
    label: "E-Mail",
    icon: <LuMail size={16} />,
    type: "email",
    description: "E-Mail-Adresseingabe",
  },
  {
    id: "phone",
    label: "Telefonnummer",
    icon: <LuPhone size={16} />,
    type: "phone",
    description: "Telefonnummereingabe",
  },
  {
    id: "link",
    label: "Link",
    icon: <LuLink size={16} />,
    type: "link",
    description: "URL/Website-Link-Eingabe",
  },
  {
    id: "date",
    label: "Datum",
    icon: <LuCalendar size={16} />,
    type: "date",
    description: "Datumsauswahl",
  },
  {
    id: "linear_scale",
    label: "Lineare Skala",
    icon: <LuChartBar size={16} />,
    type: "linear_scale",
    description: "Bewertung auf einer numerischen Skala",
  },
  {
    id: "rating",
    label: "Bewertung",
    icon: <LuStar size={16} />,
    type: "rating",
    description: "Stern- oder Zahlenbewertung",
  },
  {
    id: "ranking",
    label: "Rangfolge",
    icon: <LuList size={16} />,
    type: "ranking",
    description: "Elemente nach Präferenz ordnen",
  },
  {
    id: "emoji_selector",
    type: "emoji_selector",
    label: "Emoji-Auswahl",
    description:
      "Benutzer können aus einer Liste von Emojis mit Beschreibungen wählen",
    icon: <LuSmile />,
    defaultProperties: {
      options: [
        {
          id: crypto.randomUUID(),
          emoji: "😊",
          label: "Option 1",
        },
      ],
      allowMultiple: false,
    },
  },
];
