import React from "react";
import { NavLink } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Label as LabelIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";

export const useStyles = makeStyles((theme) => ({
  activeNavLink: {
    backgroundColor: theme.palette.action.selected,
  },
}));

const SidebarMenu = () => {
  const classes = useStyles();

  return (
    <>
      <List>
        <ListItem
          button
          component={NavLink}
          exact
          to="/"
          activeClassName={classes.activeNavLink}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText
            primary={browser.i18n.getMessage("SidebarLink_Dashboard")}
          />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem
          button
          component={NavLink}
          exact
          to="/users"
          activeClassName={classes.activeNavLink}
        >
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText
            primary={browser.i18n.getMessage("SidebarLink_Users")}
          />
        </ListItem>
        <ListItem
          button
          component={NavLink}
          exact
          to="/keywords"
          activeClassName={classes.activeNavLink}
        >
          <ListItemIcon>
            <LabelIcon />
          </ListItemIcon>
          <ListItemText
            primary={browser.i18n.getMessage("SidebarLink_Keywords")}
          />
        </ListItem>
      </List>
      {/* <Divider />
            <List>
                <ListItem button component={NavLink} exact to="/settings" activeClassName={classes.activeNavLink}>
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary={browser.i18n.getMessage('SidebarLink_Settings')} />
                </ListItem>
            </List> */}
    </>
  );
};

export default SidebarMenu;