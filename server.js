const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const url = 'https://moskva.mts.ru/personal/mobilnaya-svyaz/tarifi/vse-tarifi/mobile-tv-inet';

async function scrapeData() {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const tariffs = [];

        $('.card').each((index, element) => {
            const tariffName = $(element).find('.card-title').text();
            const tariffDescription = $(element).find('.card-description').text();
            const tariffPrice = $(element).find('.price-text').text();
            const tariffInternet = $(element).find('.card-features').text().split('\n').map(item => item.trim()).filter(item => item !== ''); // Разбиваем на массив строк

            tariffs.push({
                name: tariffName,
                description: tariffDescription,
                price: tariffPrice,
                internet: tariffInternet, // Передаем массив строк
            });
        });

        return tariffs;
    } catch (error) {
        console.error('Произошла ошибка:', error);
        return [];
    }
}

app.get('/api/tariffs', async (req, res) => {
    const tariffs = await scrapeData();
    res.json(tariffs);
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});