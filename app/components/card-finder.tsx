"use client";

import { useState } from "react";

export default function CardFinder() {
  const [cardList, setCardList] = useState("");
  const [cards, setCards] = useState<any[]>([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cardList.trim()) return;

    cardList
      .trim()
      .split(/\s+(?=\d+\s)/g) // split before numbers (Preserves multi-word card names)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((entry) => {
        const firstSpace = entry.indexOf(" ");
        const count = parseInt(entry.slice(0, firstSpace), 10);
        const name = entry.slice(firstSpace + 1).trim();
        return { count, name };
      })
      .forEach((card) => {
        const res = fetch(
          `/api/card?name=${encodeURIComponent(card.name.trim())}`,
        )
          .then((res) => res.json())
          .then((data: any) => {
            setCards((prev) => [...prev, data]);
          });
      });
  };

  return (
    <div className="flex flex-col h-15 justify-between items-start">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={cardList}
          onChange={(e) => setCardList(e.target.value)}
          className="border rounded-sm h-20"
          placeholder="Card Name"
        />
        <button className="border rounded-sm" type="submit">
          Submit
        </button>
      </form>
      <div className="flex flex-wrap w-full">
        {cards?.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

function Card(props: any) {
  const card = props.card;

  const image =
    card.image_uris?.small ?? card.card_faces?.[0]?.image_uris?.small ?? null;

  return (
    <div className="flex flex-col border rounded-sm p-2 w-40 h-80">
      <div className="flex h-1/3 border">
        <h1>{card.name}</h1>
      </div>
      <div className="flex flex-col p-5">
        <img width={150} src={image} />
      </div>
      <div>
        {card.prices?.usd && (
          <p className="text-gray-700">Scryfall Price: ${card.prices.usd}</p>
        )}
      </div>
    </div>
  );
}
