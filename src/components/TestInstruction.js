import { useState, useRef, useEffect } from 'react';
import { Button, Divider } from 'antd';
import { EXAMPLE, FOLDING_STEPS, UNFOLDING_STEPS } from '../constants/questions';
import { useTestContext } from './TestContext';
import QuestionFrames from './QuestionFrames';
import AnswerOptions from './AnswerOptions';
import { PAGE_ID, OBJ_LIST, formatTime } from '../constants/config';

function TestInstruction() {

    const { APP_STAGE, APP_COMP, setCurrComp, stageRef, objHoverOn,
        egSid, backCheckingInstruction, csvDataBuf, mousePosRef,
        setTimeupVisible, timeStamps,
    } = useTestContext();

    const [sid, setSid] = useState(egSid.current);
    const [confirmed, setConfirmed] = useState(stageRef.current !== APP_STAGE.instruction);
    const secondPartRef = useRef(null);

    const onConfirm = () => {
        console.log(`User selects '${'ABCDE'[egSid.current]}' (eg question)`);
        setConfirmed(true);

        // Wait for the DOM to update, then scroll
        setTimeout(() => {
            secondPartRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100); // slight delay ensures the content is rendered
        
    };

    useEffect(() => {
        if (sid !== null && stageRef.current === APP_STAGE.instruction) {
            onConfirm();
        }
    // eslint-disable-next-line
    }, [sid]);

    const title = (
        <div style={{ 
            fontFamily: 'Arial, sans-serif', 
            fontSize: '38px', 
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 50,
            marginBottom: 20,
            width: '80vw',
        }}>
            Paper Folding Test
        </div>
    );
    
    const THREE_MIN_IN_MILLISEC = 3 * 60 * 1000;


    const onStartButton = () => {

        // Start the test
        if (stageRef.current === APP_STAGE.instruction) {
            stageRef.current = APP_STAGE.test_main;

            timeStamps.current.t0 = Date.now();

            // Write data [the very first piece]
            csvDataBuf.current.push([
                PAGE_ID.INSTRUCTION_START,
                formatTime(),
                mousePosRef.current.x,
                mousePosRef.current.y,
                OBJ_LIST.START,
                1,
            ]);

            // Set timer to keep track of 3 mins
            setTimeout(() => {
                if (stageRef.current === APP_STAGE.test_main) {
                    setCurrComp(APP_COMP.test);
                    backCheckingInstruction.current = false;
                    
                    setTimeupVisible(true);
                    stageRef.current = APP_STAGE.timeup_3;
                }
            }, THREE_MIN_IN_MILLISEC);
        
        // return to test
        } else {

            // Write data [return to test]
            csvDataBuf.current.push([
                PAGE_ID.INSTRUCTION_REVIEW,
                formatTime(),
                mousePosRef.current.x,
                mousePosRef.current.y,
                OBJ_LIST.RETURN,
                1,
            ]);
        }

        setCurrComp(APP_COMP.test);
        backCheckingInstruction.current = false;
        objHoverOn.current = 'none';
    }

    const buttonLabel = (stageRef.current === APP_STAGE.instruction) ?
        'Start the Test' : 'Return to Test';
    
    const verb = (stageRef.current === APP_STAGE.instruction) ? 'begin' : 'continue';

    const startTestButton = (
        <div style={{
            marginTop: 20,
            marginBottom: 80,
        }}>
            <Button
                type='primary'
                style={{ 
                    width: 300, 
                    height: 50, 
                    fontSize: 20, 
                    fontWeight: 'bold',
                }}
                onClick={() => onStartButton()}
            >
                {buttonLabel}
            </Button>
        </div>
    );

    const section1 = (
        <div style={{ width: '80vw', textAlign: 'start', fontSize: '20px'}}>
            <p>
                In this test you are to imagine the folding and unfolding of pieces of paper. In each
            problem in the test there are some figures drawn at the top row and there are others
            drawn at the bottom row. The figures at the top row represent a square piece of paper being folded,
            and the last of these figures has one circles drawn on it to show where the paper
            has been punched. Each hole is punched through all the thicknesses of paper at that point.
            One of the five figures at the bottom row shows where the holes will be when the
            paper is completely unfolded. You are to decide which one of these figures is correct and click that 
            figure to select it.
            </p>
            
            <Divider/>
            <p>Now try the sample problem below.</p>
            
            <div style={{ textAlign: 'center', marginTop: 45, marginBottom: 25 }}>
                <div style={{ display: 'inline-block' }}>
                    <QuestionFrames frames={EXAMPLE.questionFrames} />
                    <Divider />
                    <AnswerOptions 
                        frames={EXAMPLE.answerOptions} 
                        sid={sid} 
                        setSid={setSid} 
                        locked={backCheckingInstruction.current}
                    />
                </div>
            </div>

        </div>
    );

    const section2 = (
        <div ref={secondPartRef}>
            <Divider />
            <div 
                style={{ 
                    textAlign: 'start', 
                    marginTop: 35, 
                    fontSize: 20, 
                    width: '80vw',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}
            >
                <p>
                    The correct answer to the sample problem above is <b>C</b>.
                    The figures below show how the paper was folded and why <b>C</b> is the correct answer.
                </p>
                <QuestionFrames frames={FOLDING_STEPS} padding={24} />
                <p>
                    Fully unfolding the punched paper reveals two 
                    holes on the left side, as shown below.
                </p>
                <QuestionFrames frames={UNFOLDING_STEPS} padding={24} />

                <Divider />
                <p>
                    In these problems all of the folds that are made are shown in the figures at the top row, 
                and the paper is not turned or moved in any way except to make the folds shown in the
                figures. Remember, the correct answer is the figure that shows the positions of the holes when
                the paper is completely unfolded.
                </p>

                <p>
                    Your score on this test will be the number marked correctly minus a fraction of the number
                marked incorrectly. Therefore, it will <u>not</u> be to your advantage to guess unless you are able to
                eliminate one or more of the answer choices as wrong.
                </p>

                <p>You will have <u>3 minutes</u> for this test.</p>
                <p>If you are ready, please click the <b>{buttonLabel}</b> button to {verb}.</p>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {title}
            {section1}
            {confirmed && section2}
            {confirmed && startTestButton}
        </div>
    );
}

export default TestInstruction;
