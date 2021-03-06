import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Spinner, Tab, Tabs, TabHeading, Icon } from "native-base";
import { connect } from "react-redux";

import FloatingActionButton from "../../components/FloatingActionButton";
import RoundListItem from "./RoundsListItem";
import * as roundsActions from "../../../actions/rounds";
import * as notificationsActions from "../../../actions/notifications";
import colors from "../../components/colors";
import { getAuth } from "../../../utils/utils";
import WarningEditingRoundModal from "./WarningEditingRoundModal";
import { setEditRoundData, clearStore } from "../../../actions/roundCreation";
import { setRouteOptions } from "../../../actions/routeOptions";
import WarningSCModal from "../../components/WarningSCModal";
import { notificationsCodes } from "../../../utils/constants";

class RoundsList extends React.Component {
  state = {
    auth: null,
    openWarningEditModal: false,
    roundEditData: {},
    loading: true,
    showSCModal: false,
  };

  async componentDidMount() {
    // Load rounds if = 0
    const { requestRounds, loadRounds, getAllStoredRounds } = this.props;
    if (requestRounds.list.length === 0) await loadRounds();
    await getAllStoredRounds();
    await this.updateAuth();
    this.handleSCWarning();
    this.setState({ loading: false });
  }

  onDeleteStoredRound = async roundIndex => {
    const { removeStoredRound } = this.props;
    await removeStoredRound(roundIndex);
  };

  updateAuth = async () => {
    const auth = await getAuth();
    this.setState({ auth });
  };

  showSCWarning = () => {
    this.setState({ showSCModal: true });
  };

  handleSCWarning = async () => {
    await this.props.getNotifications();
    const { auth } = this.state;
    if (this.props.haveFailedRegisterNotification && auth._doc.sc) {
      this.showSCWarning();
    }
  };

  hideSCWarning = () => {
    this.setState({ showSCModal: false });
  };

  async updateSCModal() {
    await this.updateAuth();
    this.setState({ showSCModal: false });
  }

  filterRounds = (roundsData, currentStatus) => {
    return roundsData.filter(r => {
      // Active tab
      if (currentStatus === "active")
        return (
          r.start &&
          r.shifts.find(s => ["pending", "current"].includes(s.status))
        );

      // To be active tab
      if (currentStatus === "starting") return !r.start;

      // Completed tab
      if (currentStatus === "completed")
        return !r.shifts.find(s => ["pending", "current"].includes(s.status));
      return false;
    });
  };

  manageStoredRoundPress = roundIndex => {
    const { nameFromCreation, storedRounds } = this.props;
    const roundEditData = storedRounds.find(r => r.roundIndex === roundIndex);

    if (nameFromCreation) {
      return this.setState({ openWarningEditModal: true, roundEditData });
    }

    return this.onContinueEditing(roundEditData);
  };

  onContinueEditing = roundData => {
    const { editRound, navigation } = this.props;
    editRound(roundData);
    this.clearModalData(() => navigation.navigate("ParticipantsAllSelected"));
  };

  clearModalData = (callback = () => {}) =>
    this.setState({ openWarningEditModal: false, roundEditData: {} }, callback);

  onCancelEditing = () => this.clearModalData();

  roundItemPress = params => {
    const { navigation } = this.props;
    if (params.isEditing) return this.manageStoredRoundPress(params.roundIndex);
    return navigation.navigate("RoundDetail", params);
  };

  static navigationOptions = {
    tabBarOptions: {
      showLabel: true,
    },
  };

  renderContent = (rounds, status) => {
    const { auth } = this.state;

    let roundsToRender = rounds;
    if (status === "starting") {
      const { storedRounds } = this.props;
      roundsToRender = [...storedRounds, ...roundsToRender];
    }

    roundsToRender = this.filterRounds(roundsToRender, status);
    // Nothing is available?
    if (roundsToRender.length === 0 && !this.state.loading) {
      return this.renderNoRoundsSection(status);
    }

    if (this.state.loading) return <Spinner />;
    // We have to append the list of rounds to Edit first.
    return (
      <FlatList
        data={roundsToRender}
        renderItem={({ item }) => (
          <RoundListItem
            detail={this.roundItemPress}
            onDeleteStoredRound={this.onDeleteStoredRound}
            {...item}
            auth={auth}
            pending
          />
        )}
        contentContainerStyle={styles.flatListContent}
      />
    );
  };

  renderNoRoundsSection = status => {
    const bodyText = "Para crear una ronda, hace click en\nel ";
    const boldBodyText = "círculo amarillo";
    const statuses = {
      active: "Aún no tenés Rondas\nactivas",
      starting: "Aún no tenés Rondas\nen curso",
      completed: "Aún no tenés Rondas\nfinalizadas",
    };

    return (
      <View
        style={{ flex: 0.8, justifyContent: "center", alignItems: "center" }}>
        <View style={{ flexDirection: "row", flex: 0.15 }}>
          <Icon
            type="MaterialCommunityIcons"
            name="alert"
            style={{ color: colors.yellow, fontSize: 60 }}
          />
        </View>
        <View style={{ flexDirection: "row", flex: 0.15 }}>
          <Text
            style={{
              fontSize: 24,
              lineHeight: 30,
              fontWeight: "bold",
              color: colors.mainBlue,
              textAlign: "center",
            }}>
            {statuses[status]}
          </Text>
        </View>
        <View style={{ flexDirection: "row", flex: 0.15 }}>
          <Text style={{ textAlign: "center" }}>
            {bodyText}
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>
              {boldBodyText}
            </Text>
          </Text>
        </View>
      </View>
    );
  };

  renderTabs = () => {
    const { requestRounds } = this.props;
    const roundsList =
      requestRounds.list &&
      requestRounds.list.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
    const tabsObj = [
      { title: "ACTIVAS", contentType: "active", key: 0 },
      { title: "POR INICIAR", contentType: "starting", key: 1 },
      { title: "TERMINADAS", contentType: "completed", key: 2 },
    ];
    return tabsObj.map(t => (
      <Tab
        key={t.key}
        heading={
          <TabHeading style={styles.roundsTabs}>
            <Text>{t.title}</Text>
          </TabHeading>
        }>
        {this.renderContent(roundsList, t.contentType)}
      </Tab>
    ));
  };

  handleChangeTab = async event => {
    this.props.saveRouteOptions({ roundsList: { page: event.i } });
    this.setState({ loading: true });
    await this.props.loadRounds(event);
    this.setState({ loading: false });
  };

  render() {
    const { navigation, clearData, activePage } = this.props;
    const { roundEditData, openWarningEditModal, showSCModal } = this.state;

    return (
      <View style={styles.container}>
        <Tabs
          onChangeTab={this.handleChangeTab}
          initialPage={activePage}
          page={activePage}
          locked>
          {this.renderTabs()}
        </Tabs>

        <FloatingActionButton
          clearData={clearData}
          nav={val => navigation.navigate(val)}
        />

        <WarningEditingRoundModal
          open={openWarningEditModal}
          roundName={roundEditData.name}
          round={roundEditData}
          onCancel={this.onCancelEditing}
          onContinue={this.onContinueEditing}
        />

        <WarningSCModal
          visible={showSCModal}
          onRequestClose={this.hideSCWarning}
          onConfirm={() => this.updateSCModal()}
        />
      </View>
    );
  }
}
const mapStateToPropsList = state => {
  return {
    requestRounds: state.rounds.requestRounds,
    storedRounds: state.rounds.storedRounds,
    nameFromCreation: state.roundCreation.name,
    activePage: state.routeOptions?.roundsList?.page,
    haveFailedRegisterNotification: state.notifications.list.some(
      item => item.code === notificationsCodes.errorSC,
    ),
  };
};

const mapDispatchToPropsList = dispatch => ({
  loadRounds: () => dispatch(roundsActions.loadRounds()),
  getAllStoredRounds: () => dispatch(roundsActions.getAllStoredRounds()),
  clearData: () => dispatch(clearStore()),
  removeStoredRound: roundIndex =>
    dispatch(roundsActions.removeStoredRound(roundIndex)),
  editRound: round => dispatch(setEditRoundData(round)),
  saveRouteOptions: options => dispatch(setRouteOptions(options)),
  getNotifications: () => notificationsActions.getNotifications(dispatch),
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  titleContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: colors.mainBlue,
    fontSize: 18,
    fontWeight: "bold",
  },
  flatListContent: {
    marginTop: 40,
    paddingBottom: 100,
  },
  roundsTabs: {
    backgroundColor: colors.mainBlue,
  },
});

export default connect(
  mapStateToPropsList,
  mapDispatchToPropsList,
)(RoundsList);
