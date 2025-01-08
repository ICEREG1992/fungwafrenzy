import { Link } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../hooks/useSettingsStore';
import FrenzyNETHeader from './FrenzyNETHeader';
import { Impact } from './interfaces';

export default function Tools() {
  const { settings, updateSettings } = useSettingsStore();

  const [localValidationOutput, setLocalValidationOutput] = useState<
    Array<Message>
  >(() => {
    return [];
  });

  const sendMessage = (m: string, c: string) => {
    setLocalValidationOutput((prev) => [...prev, { m, c }]);
  };

  const validateImpact = async () => {
    // clear output
    setLocalValidationOutput([]);
    // start by pulling the impact data
    const imp: Impact = await window.electron.ipcRenderer.invoke(
      'get-impact',
      settings.selected_impact,
      settings.impact_folder_path,
    );
    sendMessage('Impact Successfully Loaded', 'lime');
    sendMessage('All blocks have a next target that exists?', 'white');
    Object.keys(imp.blocks).forEach((key) => {
      const block = imp.blocks[key];
      // start by checking each video's targets and next
      for (let i = 0; i < block.videos.length; i += 1) {
        if (block.videos[i].next) {
          if (
            !imp.blocks[block.videos[i].next as string] &&
            !['restart', 'menu'].includes(block.videos[i].next as string)
          ) {
            sendMessage(
              `${key} ${block.videos[i].title} next does not exist`,
              'red',
            );
          }
        } else if (block.videos[i].targets) {
          for (let j = 0; j < block.videos[i].targets!.length; j++) {
            if (
              !imp.blocks[block.videos[i].targets![j].target] &&
              !['restart', 'menu'].includes(block.videos[i].targets![j].target)
            ) {
              sendMessage(
                `${key} ${block.videos[i].title} target ${j} does not exist`,
                'red',
              );
            }
          }
        }
      }
      // now check block's targets and next
      if (block.next) {
        if (
          !imp.blocks[block.next] &&
          !['restart', 'menu'].includes(block.next)
        ) {
          sendMessage(`${key} ${block.title} next does not exist`, 'red');
        }
      } else if (block.targets) {
        for (let j = 0; j < block.targets.length; j++) {
          if (
            !imp.blocks[block.targets[j].target] &&
            !['restart', 'menu'].includes(block.targets[j].target)
          ) {
            sendMessage(
              `${key} ${block.title} target ${j} does not exist`,
              'red',
            );
          }
        }
      }
    });
    sendMessage('All videos have chance or condition?', 'white');
    Object.keys(imp.blocks).forEach((key) => {
      const block = imp.blocks[key];
      if (block.videos.length > 1) {
        // run checks
        if (block.videos[0].chance) {
          for (let i = 0; i < block.videos.length; i += 1) {
            if (!block.videos[i].chance) {
              sendMessage(
                `${key} ${block.videos[i].title} missing chance parameter`,
                'red',
              );
            }
          }
        } else if (block.videos[0].condition) {
          for (let i = 0; i < block.videos.length - 1; i += 1) {
            if (!block.videos[i].condition) {
              sendMessage(
                `${key} ${block.videos[i].title} missing condition`,
                'red',
              );
            }
          }
          if (block.videos[block.videos.length - 1].condition) {
            sendMessage(
              `${key} ${block.videos[block.videos.length - 1].title} no default condition`,
              'yellow',
            );
          }
        } else {
          sendMessage(
            `${key} ${block.videos[0].title} creates unreachable video`,
            'red',
          );
        }
      } else {
        // sendMessage(`{key} has only 1 video`, 'green');
      }
    });
    sendMessage('All chance blocks add to 1?', 'white');
    Object.keys(imp.blocks).forEach((key) => {
      const block = imp.blocks[key];
      if (block.videos.length > 1) {
        // run checks
        if (block.videos[0].chance) {
          let sum = 0;
          for (let i = 0; i < block.videos.length; i += 1) {
            sum += block.videos[i].chance as number;
          }
          // 3 decimal places is probably good enough
          if (Math.round(sum * 1000) / 1000 !== 1) {
            sendMessage(
              `${key} ${block.videos[0].title} chance block does not add to 1 (${sum})`,
              'red',
            );
          }
        }
      } else {
        if (block.videos[0].chance) {
          if (block.videos[0].chance !== 1) {
            sendMessage(
              `${key} ${block.videos[0].title} is solo video without 100% chance?`,
              'red',
            );
          } else {
            sendMessage(
              `${key} ${block.videos[0].title} is solo video with chance?`,
              'yellow',
            );
          }
        }
      }
    });
  };

  return (
    <div className="menuroot">
      <FrenzyNETHeader nav page="tools" />
      <div id="body">
        <div className="NETcontainer">
          <div className="NETheader">VALIDATE IMPACT</div>
          <div className="NETbody">
            <div className="NETline">
              <b>selected_impact:</b>{' '}
              {settings.selected_impact ? settings.selected_impact : 'NONE'}{' '}
              <Link to="/browse" tabIndex={-1}>
                <a>&lt;CHANGE&gt;</a>
              </Link>
            </div>
            <div className="NETline">
              <b>validate_impact:</b>{' '}
              <a onClick={validateImpact} tabIndex={-1}>
                &lt;RUN&gt;
              </a>
            </div>
            <div className="NEToutput">
              <ValidationOutput
                messages={localValidationOutput}
              ></ValidationOutput>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Message {
  m: string;
  c: string;
}

interface ValidationOutputProps {
  messages: Array<Message>;
}

function ValidationOutput(props: ValidationOutputProps) {
  const arr: Array<React.JSX.Element> = [];
  if (props.messages.length) {
    props.messages.forEach((m: Message) => {
      arr.push(
        <div className="NEToutputline" style={{ color: m.c }}>
          {m.m}
        </div>,
      );
    });
  }
  return arr;
}
