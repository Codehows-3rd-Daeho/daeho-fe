import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { deleteGroup, getGroupList } from "../api/MasterDataApi";
import axios from "axios";
import type { Group } from "../type/SettingType";
import GroupModal from "./GroupModal";

export default function Group() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuGroupId, setMenuGroupId] = useState<number | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const list = await getGroupList();
        setGroups(list);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        console.error("그룹 로드 실패:", error);
      }
    };

    fetchGroups();
  }, []);

  const handleOpenDialog = (group?: Group) => {
    setEditingGroup(group || null);
    setOpenDialog(true);
  };
  const handleCloseDialog = async () => {
    setOpenDialog(false);
    try {
      const list = await getGroupList();
      setGroups(list);
    } catch (error) {
      console.error("그룹 목록 갱신 실패", error);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (window.confirm("삭제하시겠습니까?")) {
      try {
        await deleteGroup(groupId);
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
        alert("삭제되었습니다.");
      } catch (error) {
        alert("삭제 실패");
        console.error(error);
      }
    }
    handleCloseMenu();
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    groupId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuGroupId(groupId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuGroupId(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          그룹 관리
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2, px: 2, py: 1 }}
        >
          그룹 추가
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
        {groups.map((group) => (
          <Box key={group.id}>
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                  >
                    {group.groupName}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, group.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {group.members.map((member) => (
                    <Chip
                      key={member.id}
                      label={`${member.name} ${member.jobPositionName || ""}`}
                      size="small"
                      sx={{
                        bgcolor: "#f1f5f9",
                        color: "#475569",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                      }}
                    />
                  ))}
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontSize: "0.875rem" }}
                >
                  총 {group.members.length}명
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 1,
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 20px -6px rgba(0, 0, 0, 0.15)",
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const group = groups.find((g) => g.id === menuGroupId);
            if (group) handleOpenDialog(group);
            handleCloseMenu();
          }}
        >
          <ListItemText>수정</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuGroupId && handleDeleteGroup(menuGroupId)}>
          <ListItemText>삭제</ListItemText>
        </MenuItem>
      </Menu>

      <GroupModal
        open={openDialog}
        onClose={handleCloseDialog}
        onSuccess={handleCloseDialog}
        editingGroup={editingGroup}
      />
    </Box>
  );
}
