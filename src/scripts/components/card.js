export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  console.log('deleteCard вызван, удаляем элемент:', cardElement);
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, currentUserID, cardOwnerId }
) => {
  console.log('createCardElement вызван для карточки:', data.name);
  console.log('currentUserID:', currentUserID);
  console.log('cardOwnerId:', cardOwnerId);
  console.log('совпадают?', cardOwnerId === currentUserID);
  console.log('onDeleteCard передан?', !!onDeleteCard);

  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (likeCount) {
    likeCount.textContent = data.likes.length;
  }

  if (currentUserID && data.likes) {
    const isLiked = data.likes.some(user => user._id === currentUserID);
    if (isLiked) {
      likeButton.classList.add("card__like-button_is-active");
    }
  }

  // Логика отображения кнопки удаления
  if (cardOwnerId && currentUserID && cardOwnerId === currentUserID) {
    console.log('Это своя карточка, показываем кнопку удаления');
    deleteButton.style.display = 'block';

    if (onDeleteCard) {
      console.log('Добавляем обработчик на кнопку удаления');
      deleteButton.addEventListener("click", () => {
        console.log('Клик по кнопке удаления для карточки:', data.name);
        onDeleteCard(cardElement);
      });
    } else {
      console.log('onDeleteCard не передан, обработчик не добавлен');
    }
  } else {
    console.log('Чужая карточка или нет currentUserID, скрываем кнопку удаления');
    deleteButton.style.display = 'none';
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};