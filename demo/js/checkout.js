const addressModalBtn = document.querySelector(".ghost-btn");
const addressModal = document.querySelector("#addressModal");
const modalClose = document.querySelector(".modal__close");

addressModalBtn.addEventListener("click", () => {
  addressModal.classList.remove("popup-hidden");
})

modalClose.addEventListener("click", () => {
  addressModal.classList.add("popup-hidden");
})