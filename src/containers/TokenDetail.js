// @flow
import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Row, Col } from 'reactstrap';
import type { GlobalStore } from '../stores';
import TokenDetail from '../components/TokenDetail';
import RequestCard from '../components/RequestCard';
import RequestModal from '../components/RequestModal';
import TransferModal from '../components/TransferModal';

type Props = {
  store: GlobalStore,
};

type State = {
  requestModal: boolean,
  transferModal: boolean,
};

export default inject('store')(
  observer(
    class extends React.Component<Props, State> {
      state = {
        requestModal: false,
        transferModal: false,
      };
      handleSendRequest = () => {
        this.setState({
          requestModal: true,
        });
      };
      toggleRequestModal = () => {
        this.setState({
          requestModal: !this.state.requestModal,
        });
      };
      handleTransfer = () => {
        this.setState({
          transferModal: true,
        });
      };
      toggleTransferModal = () => {
        this.setState({
          transferModal: !this.state.transferModal,
        });
      };
      render = () => (
        <React.Fragment>
          <Row>
            <Col
              lg={{ size: 6, offset: 3 }}
              md={{ size: 8, offset: 2 }}
              sm={{ size: 10, offset: 1 }}
            >
              <div className="pb-3">
                <TokenDetail
                  tokenId={this.props.store.router.tokenId}
                  name={this.props.store.tokenDetail.name}
                  owner={this.props.store.tokenDetail.owner}
                  description={this.props.store.tokenDetail.description}
                  image={this.props.store.tokenDetail.image}
                  createdAt={this.props.store.tokenDetail.createdAt}
                  isOwner={
                    this.props.store.isAccountAvailable &&
                    this.props.store.accountAddress ===
                      this.props.store.tokenDetail.owner
                  }
                  isAccountAvailable={this.props.store.isAccountAvailable}
                  handleSendRequest={() => this.handleSendRequest()}
                  handleTransfer={() => this.handleTransfer()}
                />
              </div>
              {this.props.store.tokenDetail.requests && <h2>Requests</h2>}
              {this.props.store.tokenDetail.requests.map(request => (
                <RequestCard
                  key={request.createdAt}
                  client={request.client}
                  message={request.message}
                  createdAt={request.createdAt}
                  isOwner={
                    this.props.store.accountAddress ===
                    this.props.store.tokenDetail.owner
                  }
                  isClient={request.client === this.props.store.accountAddress}
                  handleTransfer={() => {
                    this.props.store.transfer(
                      this.props.store.accountAddress,
                      request.client,
                      this.props.store.router.tokenId
                    );
                  }}
                  handleDelete={() => {
                    throw new Error('Not implemented yet');
                  }}
                />
              ))}
            </Col>
          </Row>
          <RequestModal
            modal={this.state.requestModal}
            toggle={this.toggleRequestModal}
            onSubmit={message =>
              this.props.store.sendRequest(
                this.props.store.router.tokenId,
                message
              )
            }
          />
          <TransferModal
            modal={this.state.transferModal}
            toggle={this.toggleTransferModal}
            from={this.props.store.accountAddress}
            tokenId={this.props.store.router.tokenId}
            onSubmit={to =>
              this.props.store.transfer(
                this.props.store.accountAddress,
                to,
                this.props.store.router.tokenId
              )
            }
            isAddress={this.props.store.isAddress}
          />
        </React.Fragment>
      );
    }
  )
);
