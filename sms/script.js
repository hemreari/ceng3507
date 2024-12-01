let lectures = [];
let students = [];

// Grading scales
const gradingScales = {
  10: {
    A: { min: 90, max: 100 },
    B: { min: 80, max: 89 },
    C: { min: 70, max: 79 },
    D: { min: 60, max: 69 },
    F: { min: 0, max: 59 },
  },
  7: {
    A: { min: 93, max: 100 },
    B: { min: 85, max: 92 },
    C: { min: 77, max: 84 },
    D: { min: 70, max: 76 },
    F: { min: 0, max: 69 },
  },
};

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Lecture form submission
  document
    .getElementById("lecture-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const lectureName = document.getElementById("lecture-name").value;
      const gradingScale = document.getElementById("grading-scale").value;

      addLecture(lectureName, gradingScale);
      updateLectureSelect();
      updateLecturesList();
      this.reset();
    });

  // Student form submission
  document
    .getElementById("student-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const studentData = {
        id: document.getElementById("student-id").value,
        name: document.getElementById("student-name").value,
        surname: document.getElementById("student-surname").value,
        midterm: parseFloat(document.getElementById("midterm-score").value),
        final: parseFloat(document.getElementById("final-score").value),
        lectureId: document.getElementById("lecture-select").value,
      };

      addStudent(studentData);
      updateResults();
      updateLecturesList();
      this.reset();
    });

  // Edit form submission
  document.getElementById("edit-form").addEventListener("submit", function (e) {
    e.preventDefault();
    saveEditedStudent();
  });

  // Search functionality
  document
    .getElementById("search-input")
    .addEventListener("input", searchStudents);
  document
    .getElementById("search-type")
    .addEventListener("change", searchStudents);
  document
    .getElementById("grade-filter")
    .addEventListener("change", searchStudents);

  // Modal close handlers
  const modal = document.getElementById("edit-modal");
  const closeBtn = document.getElementsByClassName("close")[0];

  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
});

// Lecture Management Functions
function addLecture(name, scale) {
  lectures.push({
    id: Date.now(),
    name: name,
    scale: scale,
  });
}

function updateLectureSelect() {
  const select = document.getElementById("lecture-select");
  select.innerHTML = "";
  lectures.forEach((lecture) => {
    const option = document.createElement("option");
    option.value = lecture.id;
    option.textContent = lecture.name;
    select.appendChild(option);
  });
}

function deleteLecture(lectureId) {
  if (
    confirm(
      "Are you sure you want to delete this lecture? All associated students will be deleted."
    )
  ) {
    students = students.filter((s) => s.lectureId != lectureId);
    lectures = lectures.filter((c) => c.id != lectureId);
    updateLectureSelect();
    updateResults();
    updateLecturesList();
  }
}

// Student Management Functions
function addStudent(data) {
  const lecture = lectures.find((c) => c.id == data.lectureId);
  const average = calculateAverage(data.midterm, data.final);
  const letterGrade = calculateLetterGrade(average, lecture.scale);

  students.push({
    ...data,
    average,
    letterGrade,
  });
}

function editStudent(studentId) {
  const student = students.find((s) => s.id === studentId);
  if (!student) return;

  document.getElementById("edit-student-id").value = student.id;
  document.getElementById("edit-name").value = student.name;
  document.getElementById("edit-surname").value = student.surname;
  document.getElementById("edit-midterm").value = student.midterm;
  document.getElementById("edit-final").value = student.final;

  document.getElementById("edit-modal").style.display = "block";
}

function saveEditedStudent() {
  const studentId = document.getElementById("edit-student-id").value;
  const studentIndex = students.findIndex((s) => s.id === studentId);

  if (studentIndex === -1) return;

  const student = students[studentIndex];
  const lecture = lectures.find((c) => c.id == student.lectureId);

  student.name = document.getElementById("edit-name").value;
  student.surname = document.getElementById("edit-surname").value;
  student.midterm = parseFloat(document.getElementById("edit-midterm").value);
  student.final = parseFloat(document.getElementById("edit-final").value);
  student.average = calculateAverage(student.midterm, student.final);
  student.letterGrade = calculateLetterGrade(student.average, lecture.scale);

  updateResults();
  updateLecturesList();
  document.getElementById("edit-modal").style.display = "none";
}

function deleteStudent(studentId) {
  if (confirm("Are you sure you want to delete this student?")) {
    students = students.filter((s) => s.id !== studentId);
    updateResults();
    updateLecturesList();
  }
}

// Grade Calculation Functions
function calculateAverage(midterm, final) {
  return (midterm * 0.4 + final * 0.6).toFixed(2);
}

function calculateLetterGrade(average, scale) {
  const grades = gradingScales[scale];
  for (let grade in grades) {
    if (average >= grades[grade].min && average <= grades[grade].max) {
      return grade;
    }
  }
  return "F";
}

// Display Functions
function updateResults() {
  const tbody = document.getElementById("results-table");
  tbody.innerHTML = "";

  students.forEach((student) => {
    const lecture = lectures.find((c) => c.id == student.lectureId);
    const lectureName = lecture ? lecture.name : "Unknown Lecture";

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.surname}</td>
            <td>${lectureName}</td>
            <td>${student.midterm}</td>
            <td>${student.final}</td>
            <td>${student.average}</td>
            <td>${student.letterGrade}</td>
            <td>
                <button class="buton buton-edit" onclick="editStudent('${student.id}')">Edit</button>
                <button class="buton buton-delete" onclick="deleteStudent('${student.id}')">Delete</button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function updateLecturesList() {
  const tbody = document.getElementById("lectures-table");
  tbody.innerHTML = "";

  lectures.forEach((lecture) => {
    const lectureStudents = students.filter((s) => s.lectureId == lecture.id);
    const totalStudents = lectureStudents.length;
    const passedStudents = lectureStudents.filter(
      (s) => s.letterGrade !== "F"
    ).length;
    const failedStudents = totalStudents - passedStudents;
    const classAverage =
      lectureStudents.length > 0
        ? (
            lectureStudents.reduce((sum, s) => sum + parseFloat(s.average), 0) /
            totalStudents
          ).toFixed(2)
        : "N/A";

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${lecture.name}</td>
            <td>${lecture.scale}-point scale</td>
            <td>${totalStudents}</td>
            <td>${passedStudents}</td>
            <td>${failedStudents}</td>
            <td>${classAverage}</td>
            <td>
                <button class="buton buton-delete" onclick="deleteLecture('${lecture.id}')">Delete</button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

// Search Functions
function searchStudents() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  const searchType = document.getElementById("search-type").value;
  const gradeFilter = document.getElementById("grade-filter").value;

  let filteredStudents = students.filter((student) => {
    const lecture = lectures.find((c) => c.id == student.lectureId);
    const lectureName = lecture ? lecture.name.toLowerCase() : "";

    // Grade filter
    if (gradeFilter !== "all") {
      if (gradeFilter === "passed" && student.letterGrade === "F") return false;
      if (gradeFilter === "failed" && student.letterGrade !== "F") return false;
      if (
        ["A", "B", "C", "D", "F"].includes(gradeFilter) &&
        student.letterGrade !== gradeFilter
      )
        return false;
    }

    // Search type filter
    switch (searchType) {
      case "id":
        return student.id.toLowerCase().includes(searchTerm);
      case "name":
        return student.name.toLowerCase().includes(searchTerm);
      case "surname":
        return student.surname.toLowerCase().includes(searchTerm);
      case "lecture":
        return lectureName.includes(searchTerm);
      case "all":
        return (
          student.id.toLowerCase().includes(searchTerm) ||
          student.name.toLowerCase().includes(searchTerm) ||
          student.surname.toLowerCase().includes(searchTerm) ||
          lectureName.includes(searchTerm)
        );
      default:
        return true;
    }
  });

  displaySearchResults(filteredStudents);
}

function displaySearchResults(filteredStudents) {
  const tbody = document.getElementById("results-table");
  tbody.innerHTML = "";

  if (filteredStudents.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="9" class="no-results">
                    <h3>No students found matching your search criteria</h3>
                </td>
            </tr>
        `;
    return;
  }

  filteredStudents.forEach((student) => {
    const lecture = lectures.find((c) => c.id == student.lectureId);
    const lectureName = lecture ? lecture.name : "Unknown Lecture";

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.surname}</td>
            <td>${lectureName}</td>
            <td>${student.midterm}</td>
            <td>${student.final}</td>
            <td>${student.average}</td>
            <td>${student.letterGrade}</td>
            <td>
                <button class="buton buton-edit" onclick="editStudent('${student.id}')">Edit</button>
                <button class="buton buton-delete" onclick="deleteStudent('${student.id}')">Delete</button>
            </td>
        `;
    tbody.appendChild(row);
  });
}
