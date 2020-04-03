import React from 'react';
import {
    HashRouter as Router,
    Switch as RouterSwitch,
    Route,
} from 'react-router-dom';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import {
    AppBar,
    CssBaseline,
    IconButton,
    Toolbar,
    Typography,
    Drawer,
    Divider,
    Container,
} from '@material-ui/core';
import {
    ChevronLeft as ChevronLeftIcon,
    Menu as MenuIcon,
} from '@material-ui/icons';

import DashboardView from './views/DashboardView';
import CategoriesFilterView from './views/CategoriesFilterView';
import KeywordsFilterView from './views/KeywordsFilterView';
import UsersFilterView from './views/UsersFilterView';
import SidebarMenu from './components/SidebarMenu';

const drawerWidth = 240;

export const useStyles = makeStyles((theme) => ({
    'root': {
        'display': 'flex',
    },
    'toolbar': {
        'paddingRight': 24, // keep right padding when drawer closed
    },
    'toolbarIcon': {
        'display': 'flex',
        'alignItems': 'center',
        'justifyContent': 'flex-end',
        'padding': '0 8px',
        ...theme.mixins.toolbar,
    },
    'appBar': {
        'zIndex': theme.zIndex.drawer + 1,
        'transition': theme.transitions.create(['width', 'margin'], {
            'easing': theme.transitions.easing.sharp,
            'duration': theme.transitions.duration.leavingScreen,
        }),
    },
    'appBarShift': {
        'marginLeft': drawerWidth,
        'width': `calc(100% - ${drawerWidth}px)`,
        'transition': theme.transitions.create(['width', 'margin'], {
            'easing': theme.transitions.easing.sharp,
            'duration': theme.transitions.duration.enteringScreen,
        }),
    },
    'menuButton': {
        'marginRight': 36,
    },
    'menuButtonHidden': {
        'display': 'none',
    },
    'title': {
        'flexGrow': 1,
    },
    'drawerPaper': {
        'position': 'relative',
        'whiteSpace': 'nowrap',
        'width': drawerWidth,
        'transition': theme.transitions.create('width', {
            'easing': theme.transitions.easing.sharp,
            'duration': theme.transitions.duration.enteringScreen,
        }),
    },
    'drawerPaperClose': {
        'overflowX': 'hidden',
        'transition': theme.transitions.create('width', {
            'easing': theme.transitions.easing.sharp,
            'duration': theme.transitions.duration.leavingScreen,
        }),
        'width': theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            'width': theme.spacing(9),
        },
    },
    'appBarSpacer': theme.mixins.toolbar,
    'content': {
        'flexGrow': 1,
        'height': '100vh',
        'overflow': 'auto',
    },
    'container': {
        'paddingTop': theme.spacing(4),
        'paddingBottom': theme.spacing(4),
    }
}));

const App = () => {
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);
    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <Router>
            <div className={classes.root}>
                <CssBaseline />
                <AppBar position="absolute" color="primary" className={clsx(classes.appBar, open && classes.appBarShift)}>
                    <Toolbar className={classes.toolbar}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleDrawerOpen}
                            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography component="h1" variant="h6">
                            DeviantArt Filter
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" classes={{ 'paper': clsx(classes.drawerPaper, !open && classes.drawerPaperClose) }} open={open}>
                    <div className={classes.toolbarIcon}>
                        <IconButton onClick={handleDrawerClose}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <Divider />
                    <SidebarMenu />
                </Drawer>
                <main className={classes.content}>
                    <div className={classes.appBarSpacer} />
                    <Container maxWidth="lg" className={classes.container}>
                        <RouterSwitch>
                            <Route path="/users">
                                <UsersFilterView />
                            </Route>
                            <Route path="/keywords">
                                <KeywordsFilterView />
                            </Route>
                            <Route path="/categories">
                                <CategoriesFilterView />
                            </Route>
                            <Route path="/">
                                <DashboardView />
                            </Route>
                        </RouterSwitch>
                    </Container>
                </main>
            </div>
        </Router>
    );
};

export default App;
