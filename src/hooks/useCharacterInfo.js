import { useState, useEffect } from 'react';

export function useCharacterInfo(id) {
    const [character, setCharacter] = useState(null);
    const [animeography, setAnimeography] = useState([]);
    const [voiceActors, setVoiceActors] = useState([]);
    const [pictures, setPictures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function fetchDetails() {
            try {
                setLoading(true);

                // Delay to avoid API rate limits
                await new Promise(resolve => setTimeout(resolve, 300));

                // Fetch all data in parallel
                const [charRes, animeRes, voiceRes, picRes] = await Promise.all([
                    fetch(`https://api.jikan.moe/v4/characters/${id}/full`),
                    fetch(`https://api.jikan.moe/v4/characters/${id}/anime`),
                    fetch(`https://api.jikan.moe/v4/characters/${id}/voices`),
                    fetch(`https://api.jikan.moe/v4/characters/${id}/pictures`)
                ]);

                const charJson = await charRes.json();
                const animeJson = await animeRes.json();
                const voiceJson = await voiceRes.json();
                const picJson = await picRes.json();

                const data = charJson.data;

                // Format main character data
                const formattedCharacter = {
                    id: data.mal_id,
                    name: data.name,
                    name_kanji: data.name_kanji,
                    about: data.about,
                    favorites: data.favorites,
                    image: data.images?.jpg?.image_url,
                    large_image: data.images?.jpg?.large_image_url || data.images?.jpg?.image_url,
                    url: data.url,
                    nicknames: data.nicknames || []
                };

                setCharacter(formattedCharacter);
                setAnimeography(animeJson.data || []);
                setVoiceActors(voiceJson.data || []);
                setPictures(picJson.data || []);

            } catch (error) {
                console.error("Error loading character details:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDetails();
    }, [id]);

    return { character, animeography, voiceActors, pictures, loading };
}
