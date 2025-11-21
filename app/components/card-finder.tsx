"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
        fetch(`/api/card?name=${encodeURIComponent(card.name.trim())}`)
          .then((res) => res.json())
          .then((data: any) => {
            setCards((prev) => [...prev, data]);
          });
      });
  };

  function splitCards(cards: any[]) {
    return {
      proxy: cards.filter((card: any) => {
        const usd = parseFloat(card.prices?.usd ?? "0");
        return usd >= 1;
      }),

      real: cards.filter((card: any) => {
        const usd = parseFloat(card.prices?.usd ?? "0");
        return usd < 1;
      }),
    };
  }

  function getTotalCost(cards: any[]) {
    return cards.reduce((acc, card) => {
      const priceStr = card.prices?.usd;
      const price = priceStr ? parseFloat(priceStr) : 0;

      if (Number.isNaN(price)) return acc;
      return acc + price;
    }, 0);
  }

  function getTCGName(card: any) {
    // Base name: strip split/DFC second face for Mass Entry
    // const baseName = (card.name ?? "").split("//")[0].trim();
    const baseName = (card.name ?? "").trim();
    let name = baseName;

    // Border types
    switch (card.border_color) {
      case "borderless":
        name += " (Borderless)";
        break;
    }

    // Frame effects (extended, showcase, retro, etc.)
    // const effects: string[] = card.frame_effects ?? [];

    // if (effects.includes("extended")) {
    //   name += " (Extended Art)";
    // }
    // if (effects.includes("showcase")) {
    //   name += " (Showcase)";
    // }
    // if (effects.includes("retro")) {
    //   name += " (Retro Frame)";
    // }
    // if (effects.includes("inverted")) {
    //   name += " (Inverted)";
    // }
    // Etched foil
    // if (card.finishes?.includes("etched")) {
    //   name += " (Etched Foil)";
    // }

    return name;
  }

  const textCardList = cards
    .map((card: any) => {
      const tcgName = getTCGName(card);
      const count = card.count ?? 1;
      return `${count} ${tcgName}`;
    })
    .join("\n");

  // 1 Witch Enchanter // Witch-Blessed Meadow

  return (
    <div className="flex flex-col w-full justify-between items-start gap-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          value={cardList}
          onChange={(e) => setCardList(e.target.value)}
          className="border rounded-sm h-20"
          placeholder="List of cards here"
        />
        <Button>Submit</Button>
      </form>
      <div className="hidden">
        <p>Total Price: ${Math.round(getTotalCost(cards))}</p>
        <h1>
          Total Real TCG Player Cost: $
          {getTotalCost(splitCards(cards).real).toFixed(2)}
        </h1>
        <h3>Amount of cards: {splitCards(cards).real.length}</h3>
        <h1>
          Total Not Buying TCG Cost: $
          {getTotalCost(splitCards(cards).proxy).toFixed(2)}
        </h1>
        <h3>Amount of cards: {splitCards(cards).proxy.length}</h3>
      </div>
      <div className="flex w-full flex-col gap-10">
        <Tabs defaultValue="real">
          <TabsList>
            <TabsTrigger value="real" disabled={cards.length <= 0}>
              Real
            </TabsTrigger>
            <TabsTrigger value="proxy" disabled={cards.length <= 0}>
              Proxy
            </TabsTrigger>
          </TabsList>
          <TabsContent value="real">
            <CardCarousel cards={splitCards(cards).real} />
          </TabsContent>
          <TabsContent value="proxy">
            <CardCarousel cards={splitCards(cards).proxy} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="w-full border rounded-sm mt-5">
        <CopyButton content={textCardList} />
        {cards.map((card, index) => (
          <p key={index}>1 {card.name}</p>
        ))}
      </div>
    </div>
  );
}

function CardCarousel(props: any) {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {props.cards?.map((card: any, index: any) => (
          <CarouselItem
            key={index}
            className="flex items-center justify-center sm:basis-1/2 md:basis-1/4 lg:basis-1/5"
          >
            <div className="p-1">
              <MagicCard card={card} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

function MagicCard(props: any) {
  const card = props.card;

  const image =
    card.image_uris?.small ?? card.card_faces?.[0]?.image_uris?.small ?? null;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{card.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center">
        <img width={150} src={image} />
      </CardContent>
      <CardFooter>
        <p>${card.prices.usd}</p>
      </CardFooter>
    </Card>
  );
}
