import axios from 'axios';

const config = {
    baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-202",
    headers: {
        authorization: "21b7ada1-83eb-4b6a-9f5b-caff067c046d",
        "Content-Type": "application/json",
    },
};

const api = axios.create({
    baseURL: config.baseUrl,
    headers: config.headers,
});

api.interceptors.response.use(
    response => response.data,
    error => {
        const message = error.response
            ? `Ошибка: ${error.response.status} - ${error.response.statusText}`
            : error.message;
        return Promise.reject(message);
    }
);

export const getUserInfo = () => {
    return api.get('/users/me');
};

export const getCardList = () => {
    return api.get('/cards');
};

export const setUserInfo = ({ name, about }) => {
    return api.patch('/users/me', { name, about });
};

export const setUserAvatar = (avatarUrl) => {
    return api.patch('/users/me/avatar', { avatar: avatarUrl });
};

export const setNewCard = ({ name, link }) => {
    return api.post('/cards', { name, link });
};

export const setDeleteCard = (id) => {
    return api.delete(`/cards/${id}`);
}

export const changeLikeStatus = (cardID, isLiked) => {
    const method = isLiked ? 'delete' : 'put';
    return api[method](`/cards/likes/${cardID}`);
}