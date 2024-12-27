let isSortedByNewest = false;
let comments;

const commentsServer = 'http://localhost:3333/comments'
const commentServer = 'http://localhost:3333/comment'

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

    const commentContentValue = comment.status === 'retracted'
      ? 'Retracted'
      : escapeHTML(comment.comment);

    const commentContent = `
      <p>
      <strong>${escapeHTML(comment.name)} (${escapeHTML(comment.email)}):</strong>
      <span class="content">${commentContentValue}</span> <span class="time">${formatTimestamp(comment.timestamp_utc)}</span>
      <button class="retractBtn" type="button">Retract</button>
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

async function retract(id) {
  try {
    const response = await fetch(`http://localhost:3333/comment/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "retracted" }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update record: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Record updated successfully:", result);
  } catch (error) {
    console.error("Error updating record:", error);
  }
}

document.getElementById("toggle-sort").addEventListener("click", toggleSort);
document.addEventListener('DOMContentLoaded', fetchComments);
