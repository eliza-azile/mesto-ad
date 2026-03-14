/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { getUserInfo, getCardList, setUserInfo, setUserAvatar, setNewCard, setDeleteCard, changeLikeStatus } from '/src/scripts/components/api.js';
import { createCardElement, likeCard, deleteCard } from '/src/scripts/components/card.js';
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from '/src/scripts/components/modal.js';
import { enableValidation, clearValidation } from '/src/scripts/components/validation.js';


// Элементы DOM
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');
const placesList = document.querySelector('.places__list');
const removeCardPopup = document.querySelector('.popup_type_remove-card');
const removeCardForm = document.forms['remove-card'];

let cardToDelete = null;
let cardToDeleteId = null;
let cardToDeleteElement = null;

// Конфиг для валидации
const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

let currentUser = null;

// Загружаем данные пользователя и карточки
Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cardsData]) => {
    console.log('Данные загружены:', { userData, cardsData });

    currentUser = userData;

    renderProfile(userData);

    renderCards(cardsData, userData._id);
  })
  .catch(err => {
    console.error('Ошибка загрузки данных:', err);
  });

function renderProfile(userData) {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;

  if (userData.avatar) {
    profileImage.style.backgroundImage = `url(${userData.avatar})`;
    profileImage.style.backgroundSize = 'cover';
    profileImage.style.backgroundPosition = 'center';
  }
}

function renderCards(cards, currentUserId) {
  console.log('renderCards вызван, currentUserId:', currentUserId);

  cards.forEach(card => {
    console.log('Создаем карточку:', card.name, 'owner:', card.owner._id);

    const cardElement = createCardElement(card, {
      onPreviewPicture: (data) => openImagePopup(data),
      onLikeIcon: (likeButton) => {
        const cardId = card._id;
        const isLiked = likeButton.classList.contains('card__like-button_is-active');

        changeLikeStatus(cardId, isLiked)
          .then(updatedCard => {
            likeCard(likeButton);
            const likeCount = likeButton.closest('.card').querySelector('.card__like-count');
            if (likeCount) {
              likeCount.textContent = updatedCard.likes.length;
            }
          })
          .catch(err => console.error('Ошибка лайка:', err));
      },
      onDeleteCard: (cardElement) => {
        console.log('onDeleteCard вызван для карточки:', card.name);
        console.log('Сохраняем данные для удаления:', {
          card: card,
          id: card._id,
          element: cardElement
        });

        cardToDelete = card;
        cardToDeleteId = card._id;
        cardToDeleteElement = cardElement;

        console.log('Открываем попап удаления');
        openModalWindow(removeCardPopup);
        setCloseModalWindowEventListeners(removeCardPopup);
      },
      currentUserID: currentUserId,
      cardOwnerId: card.owner._id
    });
    placesList.append(cardElement);
  });
}

function openImagePopup(data) {
  const imagePopup = document.querySelector('.popup_type_image');
  const popupImage = imagePopup.querySelector('.popup__image');
  const popupCaption = imagePopup.querySelector('.popup__caption');

  popupImage.src = data.link;
  popupImage.alt = data.name;
  popupCaption.textContent = data.name;

  openModalWindow(imagePopup);
  setCloseModalWindowEventListeners(imagePopup);
}

function setupPopups() {
  // Попап редактирования профиля
  const editPopup = document.querySelector('.popup_type_edit');
  const editButton = document.querySelector('.profile__edit-button');
  const editForm = document.forms['edit-profile'];

  editButton.addEventListener('click', () => {
    cardToDelete = null;
    cardToDeleteId = null;
    cardToDeleteElement = null;

    editForm.elements['user-name'].value = profileTitle.textContent;
    editForm.elements['user-description'].value = profileDescription.textContent;

    clearValidation(editForm, validationConfig);

    openModalWindow(editPopup);
    setCloseModalWindowEventListeners(editPopup);
  });

  editForm.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const submitButton = editForm.querySelector('.popup__button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Сохранение...';

    const name = editForm.elements['user-name'].value;
    const about = editForm.elements['user-description'].value;

    setUserInfo({ name, about })
      .then(updatedUser => {
        renderProfile(updatedUser);
        closeModalWindow(editPopup);
      })
      .catch(err => {
        console.error('Ошибка обновления профиля:', err);
      })
      .finally(() => {
        submitButton.textContent = originalText;
      });
  });

  // Попап добавления карточки
  const addPopup = document.querySelector('.popup_type_new-card');
  const addButton = document.querySelector('.profile__add-button');
  const addForm = document.forms['new-place'];

  addButton.addEventListener('click', () => {
    cardToDelete = null;
    cardToDeleteId = null;
    cardToDeleteElement = null;

    addForm.reset();
    clearValidation(addForm, validationConfig);
    openModalWindow(addPopup);
    setCloseModalWindowEventListeners(addPopup);
  });

  addForm.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const submitButton = addForm.querySelector('.popup__button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Создание...';

    const name = addForm.elements['place-name'].value;
    const link = addForm.elements['place-link'].value;

    setNewCard({ name, link })
      .then(newCard => {
        const cardElement = createCardElement(newCard, {
          onPreviewPicture: (data) => openImagePopup(data),
          onLikeIcon: (likeButton) => {
            const cardId = newCard._id;
            const isLiked = likeButton.classList.contains('card__like-button_is-active');

            changeLikeStatus(cardId, isLiked)
              .then(updatedCard => {
                likeCard(likeButton);
                const likeCount = likeButton.closest('.card').querySelector('.card__like-count');
                if (likeCount) {
                  likeCount.textContent = updatedCard.likes.length;
                }
              })
              .catch(err => console.error('Ошибка лайка:', err));
          },
          onDeleteCard: (cardElement) => {
            cardToDelete = card;
            cardToDeleteId = card._id;
            cardToDeleteElement = cardElement

            openModalWindow(removeCardPopup);
            setCloseModalWindowEventListeners(removeCardPopup);
          },
          currentUserID: currentUser._id,
          cardOwnerId: newCard.owner._id
        });
        placesList.prepend(cardElement);
        closeModalWindow(addPopup);
      })
      .catch(err => {
        console.error('Ошибка создания карточки:', err);
      })
      .finally(() => {
        submitButton.textContent = originalText;
      });
  });

  // Попап обновления аватара
  const avatarPopup = document.querySelector('.popup_type_edit-avatar');
  const avatarForm = document.forms['edit-avatar'];

  profileImage.addEventListener('click', () => {
    cardToDelete = null;
    cardToDeleteId = null;
    cardToDeleteElement = null;

    avatarForm.reset();
    clearValidation(avatarForm, validationConfig);
    openModalWindow(avatarPopup);
    setCloseModalWindowEventListeners(avatarPopup);
  });

  avatarForm.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const submitButton = avatarForm.querySelector('.popup__button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Сохранение...';

    const avatarUrl = avatarForm.elements['user-avatar'].value;

    setUserAvatar(avatarUrl)
      .then(updatedUser => {
        renderProfile(updatedUser);
        closeModalWindow(avatarPopup);
      })
      .catch(err => {
        console.error('Ошибка обновления аватара:', err);
      })
      .finally(() => {
        submitButton.textContent = originalText;
      });
  });

  //Попап подтверждения удаления
  // Попап подтверждения удаления
  removeCardForm.addEventListener('submit', (evt) => {
    evt.preventDefault();

    console.log('Форма удаления отправлена');
    console.log('cardToDeleteId:', cardToDeleteId);
    console.log('cardToDeleteElement:', cardToDeleteElement);

    if (!cardToDeleteId || !cardToDeleteElement) {
      console.log('Нет карточки для удаления!');
      closeModalWindow(removeCardPopup);
      return;
    }

    const submitButton = removeCardForm.querySelector('.popup__button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Удаление...';

    console.log('Отправляем DELETE запрос для ID:', cardToDeleteId);

    setDeleteCard(cardToDeleteId)
      .then(() => {
        console.log('✅ Карточка удалена с сервера');
        deleteCard(cardToDeleteElement);
        closeModalWindow(removeCardPopup);

        cardToDelete = null;
        cardToDeleteId = null;
        cardToDeleteElement = null;
      })
      .catch(err => {
        console.error('❌ Ошибка удаления:', err);
      })
      .finally(() => {
        submitButton.textContent = originalText;
      });
  });

  //Обработчик для закрытия попапа (чтобы очищать данные при закрытии без удаления)
  removeCardPopup.addEventListener('mousedown', evt => {
    if (evt.target.classList.contains('popup') || evt.target.classList.contains('popup__close')) {
      cardToDelete = null;
      cardToDeleteId = null;
      cardToDeleteElement = null;
    }
  });
}

enableValidation(validationConfig);

setupPopups();

const imagePopup = document.querySelector('.popup_type_image');
setCloseModalWindowEventListeners(imagePopup);