import React, { useEffect, useState } from "react";
import {
  Input,
  Button,
  List,
  Checkbox,
  Space,
  DatePicker,
  Select,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;

const API_URL =
  "https://v1.nocodeapi.com/mertinelli10/google_sheets/MwzTRiPkagOnajLu?tabId=Sheet1";

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newDate, setNewDate] = useState(null);
  const [filter, setFilter] = useState("all");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data.data.slice(1)); // İlk satır başlık
    } catch (error) {
      message.error("Veriler alınamadı.");
    }
  };

  const addTask = async () => {
    if (!newTask) return message.warning("Görev giriniz.");

    const dateStr = newDate ? dayjs(newDate).format("YYYY-MM-DD") : "";

    try {
      await axios.post(API_URL, [[newTask, "FALSE", dateStr]]);
      setNewTask("");
      setNewDate(null);
      fetchTasks();
      message.success("Görev eklendi!");
    } catch (error) {
      message.error("Görev eklenemedi.");
    }
  };

  const deleteTask = async (index) => {
    const rowIndex = index + 2; // başlık dahil
    try {
      await axios.delete(`${API_URL}&row=${rowIndex}`);
      fetchTasks();
    } catch {
      message.error("Silinemedi.");
    }
  };

  const toggleComplete = async (index, checked) => {
    const rowIndex = index + 2;
    try {
      const row = tasks[index];
      await axios.put(API_URL, {
        range: `A${rowIndex}:C${rowIndex}`,
        values: [[row[0], checked ? "TRUE" : "FALSE", row[2]]],
      });
      fetchTasks();
    } catch {
      message.error("Güncellenemedi.");
    }
  };

  const updateTaskText = async (index) => {
    const rowIndex = index + 2;
    const row = tasks[index];
    try {
      await axios.put(API_URL, {
        range: `A${rowIndex}:C${rowIndex}`,
        values: [[editingText, row[1], row[2]]],
      });
      setEditingIndex(null);
      setEditingText("");
      fetchTasks();
    } catch {
      message.error("Düzenlenemedi.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task[1] === "TRUE";
    if (filter === "incomplete") return task[1] !== "TRUE";
    return true;
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "50px auto" }}>
      <h2>📝 Todo List</h2>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Yeni görev"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onPressEnter={addTask}
          style={{ width: 200 }}
        />
        <DatePicker onChange={(date) => setNewDate(date)} />
        <Button type="primary" onClick={addTask}>
          Ekle
        </Button>
        <Select value={filter} onChange={setFilter} style={{ width: 150 }}>
          <Option value="all">Tümü</Option>
          <Option value="completed">Tamamlanan</Option>
          <Option value="incomplete">Tamamlanmayan</Option>
        </Select>
      </Space>

      <List
        bordered
        dataSource={filteredTasks}
        renderItem={(item, index) => {
          const isEditing = editingIndex === index;

          return (
            <List.Item
              actions={[
                isEditing ? (
                  <>
                    <Button type="link" onClick={() => updateTaskText(index)}>
                      Kaydet
                    </Button>
                    <Button
                      type="link"
                      danger
                      onClick={() => setEditingIndex(null)}
                    >
                      İptal
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setEditingIndex(index);
                        setEditingText(item[0]);
                      }}
                    >
                      Düzenle
                    </Button>
                    <Button danger onClick={() => deleteTask(index)}>
                      Sil
                    </Button>
                  </>
                ),
              ]}
            >
              <Space>
                <Checkbox
                  checked={item[1] === "TRUE"}
                  onChange={(e) => toggleComplete(index, e.target.checked)}
                />
                {isEditing ? (
                  <Input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                ) : (
                  <span
                    style={{
                      textDecoration:
                        item[1] === "TRUE" ? "line-through" : "none",
                    }}
                  >
                    {item[0]} {item[2] && <small>({item[2]})</small>}
                  </span>
                )}
              </Space>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default TodoList;
