"use client";
import { useEffect, useState } from "react";
import Checkbox from "../../Checkbox";
import Tag from "../Tag.jsx";
import { FaTrashAlt } from "react-icons/fa";
import { TbReload } from "react-icons/tb";
import { COLORS } from "@/data/dynamic/Tags";
import Popup from "../Popup";
import Input from "../Input";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Toolbar = ({
  input,
  setInput,
  tags,
  setObjects,
  objects,
  filters,
  page,
}) => {
  const router = useRouter();

  const [deletePopup, setDeletePopup] = useState({
    title: "Delete Confirmation",
    text: "Are you sure you want to delete these row(s)? This action is irreversible.",
    color: "red",
    visible: false,
  });

  const [winnerPopup, setWinnerPopup] = useState({
    title: "Status Change Restricted",
    text: "Changing status from 'winner' is restricted. You can check the Prize page for more information.",
    color: "green",
    visible: false,
  });

  const [toggle, setToggle] = useState(false);

  const onClick = (value) => {
    const selectedWinners = objects.some(
      (obj) => obj.selected && obj.status === "winner"
    );
    if (selectedWinners) {
      setWinnerPopup({
        title: "Status Change Restricted",
        text: "Changing status from 'winner' is restricted. You can check the Prize page for more information.",
        color: "green",
        visible: true,
      });
      return;
    }

    setToggle(false);
    const items = objects.filter((object) => object.selected);
    axios.put(`/api/${page}`, {
      objects: items,
      status: value,
      attribute: "status",
    });
    setObjects(
      objects.map((a) => {
        if (a.selected) {
          a.status = value;
          a.selected = false;
        }
        return a;
      })
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setObjects(
      objects.map((a) => {
        let boolean = false;

        Object.values(filters).map(({ value, state }) => {
          if (
            a.status === value &&
            state &&
            a.name.toLowerCase().match(input.input.toLowerCase())
          ) {
            boolean = true;
          }
        });
        return { ...a, hidden: !boolean };
      })
    );
  };

  const selectAll = () => {
    setObjects(
      objects.map((a) => {
        a.selected = !toggle;
        return a;
      })
    );
    setToggle(!toggle);
  };

  const handleDelete = () => {
    setToggle(false);
    const remove = objects.filter((object) => object.selected);
    const keep = objects.filter((object) => !object.selected);
    setObjects(keep);
    axios
      .put(`/api/${page}`, { objects: remove, attribute: "role" })
      .then(() => {
        toast("✅ Successfully Deleted");
      });
    setDeletePopup({ ...deletePopup, visible: true });
  };

  const handleReload = () => {
    axios.get(`/api/${page}`).then((response) => {
      setObjects(response.data.items);
    });
  };

  useEffect(() => {
    handleReload();
  }, []);

  return (
    <div className="w-full flex items-center" data-cy="toolbar">
      <div className="w-2/3 flex items-center">
        <div className="mr-4" data-cy="select-all">
          <Checkbox onClick={selectAll} toggle={toggle} />
        </div>
        <div className="flex flex-row gap-2 ">
          {tags.map((tag, index) => (
            <Tag
              key={index}
              text={tag.text}
              onClick={() => onClick(tag.value)}
              color={COLORS[tag.value]}
              setObjects={setObjects}
              objects={objects}
            />
          ))}
        </div>
        <form className="flex ml-2 w-full items-center" onSubmit={handleSubmit}>
          <Input
            classes="w-full"
            object={input}
            setObject={setInput}
            clear={true}
            label="input"
            maxLength={60}
            placeholder="search"
            showLabel={false}
          />
        </form>
      </div>
      <TbReload onClick={handleReload} />
      <div className="flex w-1/3">
        <FaTrashAlt
          data-cy="delete"
          onClick={() => setDeletePopup({ ...deletePopup, visible: true })}
          size={22.5}
          className="ml-5 text-hackathon-gray-300 hover:opacity-70 duration-150 hover:cursor-pointer"
        />
        {deletePopup.visible && (
          <Popup
            popup={deletePopup}
            onClick={handleDelete}
            setPopup={setDeletePopup}
            text="confirm"
          />
        )}
        {winnerPopup.visible && (
          <Popup
            popup={winnerPopup}
            onClick={() => router.push("/admin/prizes")}
            setPopup={setWinnerPopup}
            text="prizes"
          />
        )}
      </div>
    </div>
  );
};

export default Toolbar;
