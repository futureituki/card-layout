import axios from "axios";
export const getToken = async () => {
    const encodedData = btoa(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`);
    // Spotifyのトークンエンドポイントにリクエストを送信する
    const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${encodedData}`,
            },
        }
    );
    const accessToken = response.data.access_token;
    return accessToken;
}