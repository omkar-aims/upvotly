import Alpine from "alpinejs";
import sort from "@alpinejs/sort";

import "./style.css";

window.Alpine = Alpine;

// APIS
const getIdeas = async () => {
  try {
    const res = await fetch("https://my.beastscan.com/test-kit");
    const ideas = await res.json();

    return ideas;
  } catch (err) {
    console.log(err);
    throw new Error("Error Fetching ideas");
  }
};

const cacheResult = (result) => {
  localStorage.setItem("ideas", JSON.stringify(result));
};

Alpine.plugin(sort);

// Store for modal

Alpine.store("modal", {
  isOpen: false,
  title: "",
  type: "",
  idea: null,

  close() {
    this.isOpen = false;
  },

  open(title = "Modal", type, editTitle = null) {
    this.isOpen = true;
    this.title = title;
    this.type = type;

    if (editTitle) {
      const ideas = JSON.parse(localStorage.getItem("ideas")) || [];
      const idea = ideas.find(
        (idea) => idea.title.toLowerCase() === editTitle.toLowerCase()
      );
      this.idea = idea;
    } else {
      this.idea = null;
    }
  },
});

// Store for IDEAS

Alpine.store("ideas", {
  data: [],
  isLoading: true,

  async init() {
    const ideas = JSON.parse(localStorage.getItem("ideas"));

    if (!ideas) {
      this.data = await getIdeas();
      cacheResult(this.data);
    } else {
      this.data = ideas;
    }
    this.isLoading = false;
  },

  add(idea) {
    this.data = [idea, ...this.data];
    cacheResult(this.data);
  },

  update(title, updatedIdea) {
    const index = this.data.findIndex(
      (idea) => idea.title.toLowerCase() === title.toLowerCase()
    );

    this.data[index] = updatedIdea;
    cacheResult(this.data);
  },

  upVote(title) {
    this.data.forEach((idea) => {
      if (idea.title.toLowerCase() === title.toLowerCase()) {
        if (idea.myVote === "up") {
          idea.votes.up--;
          idea.myVote = null;
        } else if (idea.myVote === "down") {
          idea.votes.down--;
          idea.votes.up++;
          idea.myVote = "up";
        } else {
          idea.votes.up++;
          idea.myVote = "up";
        }
      }
    });
    cacheResult(this.data);
  },
  downVote(title) {
    this.data.forEach((idea) => {
      if (idea.title.toLowerCase() === title.toLowerCase()) {
        if (idea.myVote === "down") {
          idea.votes.down--;
          idea.myVote = null;
        } else if (idea.myVote === "up") {
          idea.votes.up--;
          idea.votes.down++;
          idea.myVote = "down";
        } else {
          idea.votes.down++;
          idea.myVote = "down";
        }
      }
    });
    cacheResult(this.data);
  },

  sort(sortBy) {
    switch (sortBy) {
      case "up":
        this.data.sort((a, b) => b.votes.up - a.votes.up);
        break;
      case "down":
        this.data.sort((a, b) => a.votes.down - b.votes.down);
        break;

      default:
        this.data.sort((a, b) =>
          a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1
        );
    }
  },

  async reset() {
    console.log("RESET");
    this.isLoading = true;
    this.data = await getIdeas();
    localStorage.setItem("ideas", JSON.stringify(this.data));
    this.isLoading = false;
  },
});

Alpine.start();
