(function () {
  const writeBtn = document.getElementById("write-review-btn");
  const cancelBtn = document.getElementById("cancel-review-btn");
  const form = document.getElementById("review-form");
  const sortButtons = document.querySelectorAll(".sort-btn");
  const commentToggles = document.querySelectorAll(".comment-toggle");

  // 안전 체크
  if (writeBtn && form) {
    writeBtn.addEventListener("click", () => {
      form.classList.toggle("hidden");
      form.setAttribute("aria-hidden", form.classList.contains("hidden") ? "true" : "false");
    });
  }

  if (cancelBtn && form) {
    cancelBtn.addEventListener("click", () => {
      form.classList.add("hidden");
      form.setAttribute("aria-hidden", "true");
    });
  }

  // 댓글 토글
  commentToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".review-item");
      if (!card) return;

      const comments = card.querySelector(".comments-section");
      if (!comments) return;

      comments.classList.toggle("hidden");
      comments.setAttribute("aria-hidden", comments.classList.contains("hidden") ? "true" : "false");
    });
  });

  // 정렬 버튼 UI 토글
  sortButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sortButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });
})();
