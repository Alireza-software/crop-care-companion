export type Crop = {
  slug: string;
  name: string;
  urdu: string;
  emoji: string;
  kind: "fruit" | "vegetable";
};

export const CROPS: Crop[] = [
  { slug: "tomato", name: "Tomato", urdu: "ٹماٹر", emoji: "🍅", kind: "vegetable" },
  { slug: "cucumber", name: "Cucumber", urdu: "کھیرا", emoji: "🥒", kind: "vegetable" },
  { slug: "potato", name: "Potato", urdu: "آلو", emoji: "🥔", kind: "vegetable" },
  { slug: "onion", name: "Onion", urdu: "پیاز", emoji: "🧅", kind: "vegetable" },
  { slug: "chilli", name: "Chilli", urdu: "مرچ", emoji: "🌶️", kind: "vegetable" },
  { slug: "carrot", name: "Carrot", urdu: "گاجر", emoji: "🥕", kind: "vegetable" },
  { slug: "brinjal", name: "Brinjal", urdu: "بینگن", emoji: "🍆", kind: "vegetable" },
  { slug: "cabbage", name: "Cabbage", urdu: "بند گوبھی", emoji: "🥬", kind: "vegetable" },
  { slug: "apple", name: "Apple", urdu: "سیب", emoji: "🍎", kind: "fruit" },
  { slug: "grapes", name: "Grapes", urdu: "انگور", emoji: "🍇", kind: "fruit" },
  { slug: "mango", name: "Mango", urdu: "آم", emoji: "🥭", kind: "fruit" },
  { slug: "banana", name: "Banana", urdu: "کیلا", emoji: "🍌", kind: "fruit" },
  { slug: "orange", name: "Orange", urdu: "مالٹا", emoji: "🍊", kind: "fruit" },
  { slug: "pomegranate", name: "Pomegranate", urdu: "انار", emoji: "🍑", kind: "fruit" },
  { slug: "peach", name: "Peach", urdu: "آڑو", emoji: "🍑", kind: "fruit" },
  { slug: "melon", name: "Melon", urdu: "خربوزہ", emoji: "🍈", kind: "fruit" },
];

export const cropByName = (name: string) =>
  CROPS.find((c) => c.name.toLowerCase() === name.toLowerCase());
