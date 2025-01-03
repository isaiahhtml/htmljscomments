import hello from "./hello.js";
let isSortedByNewest = false;
let comments;

const API_URL = 'http://localhost:3333'
const commentServer = 'http://localhost:3333/comment'

if (!API_URL) {
  throw new Error('Invalid API_URL or id');
}

hello();

async function fetchComments() {
  try {
    const response = await fetch(`${API_URL}/comments`);

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
      <p data-id="${comment.id}">
      <strong>${escapeHTML(comment.name)} (${escapeHTML(comment.email)}):</strong>
      <span class="content">${commentContentValue}</span> <span class="time">${formatTimestamp(comment.timestamp_utc)}</span>
      <button class="retractBtn" type="button" data-id="${comment.id}" onclick="sendId(this)">Retract</button>
      </p>
      `;

    commentDiv.innerHTML = commentContent;
    fragment.appendChild(commentDiv);
  });

  commentsContainer.innerHTML = '';
  commentsContainer.appendChild(fragment);
}

function toggleSort(element) {
  isSortedByNewest = !isSortedByNewest;
  element.innerHTML = element.innerHTML === "Sort By Oldest" ? "Sort By Newest": "Sort By Oldest";
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
    hour12: true
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

function sendId(element) {
  const id = element.getAttribute("data-id");
  retract(id);
}

async function retract(id) {
  try {
    const response = await fetch(`${API_URL}/comments/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch record: ${response.statusText}`);
    }

    const record = await response.json();
    console.log(record);

    const updateStatus = record.status === "retracted" ? "default" : "retracted";

    const updateResponse = await fetch(`${API_URL}/comments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: updateStatus })
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update record: ${updateResponse.statusText}`)
    }

    const result = await updateResponse.json();
    console.log("Record updated successfully:", result);
  } catch (error) {
    console.error("Error updating record:", error);
  }
}

document.addEventListener('DOMContentLoaded', fetchComments);
