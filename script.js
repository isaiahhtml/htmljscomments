let isSortedByNewest = false;
let comments;

const commentsServer = 'http://localhost:3333/comments'

async function fetchComments() {
  try {
    const response = await fetch(commentsServer);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    comments = await response.json();

    if (isSortedByNewest === true) {
      comments.sort((a, b) => {
        const dateA = new Date(a.timestamp_utc);
        const dateB = new Date(b.timestamp_utc);
        return isSortedByNewest ? dateB - dateA : dateA - dateB;
      });
    }

    renderComments();
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
}

function renderComments() {
  const commentsContainer = document.getElementById('comments');

  const fragment = document.createDocumentFragment();

  comments.forEach(comment => {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';

    const commentContent = `
      <p>
      <strong>${escapeHTML(comment.name)} (${escapeHTML(comment.email)}):</strong>
      <span class="content">${escapeHTML(comment.comment)}</span> <span class="time">${formatTimestamp(comment.timestamp_utc)}</span>
      <button class="retractBtn" type="button" onclick="retractComment(this)">Retract</button>
      </p>
      `;

    commentDiv.innerHTML = commentContent;
    fragment.appendChild(commentDiv);
  });

  commentsContainer.innerHTML = '';
  commentsContainer.appendChild(fragment);
}

function toggleSort(comments) {
  isSortedByNewest = !isSortedByNewest;
  fetchComments();
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

function retractComment(button) {
  const commentDiv = button.closest('.comment');
  if (commentDiv) {
    const paragraph = commentDiv.querySelector('.content');
    if (paragraph) {
      paragraph.textContent = "Retracted";
    }
  }
}

document.getElementById("toggle-sort").addEventListener("click", toggleSort);
document.addEventListener('DOMContentLoaded', fetchComments);
